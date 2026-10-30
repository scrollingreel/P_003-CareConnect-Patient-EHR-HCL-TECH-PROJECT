package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.domain.AppUser;
import com.apexcare.rag.domain.RagAuditEvent;
import com.apexcare.rag.domain.RagResponseStatus;
import com.apexcare.rag.repository.RagAuditEventRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RagAssistantService {
    private static final List<String> OUT_OF_SCOPE_TERMS = List.of(
        "diagnose", "diagnosis", "dosage", "dose", "prescribe", "prescription", "prescribed",
        "can i take", "should i take", "can i eat", "should i eat", "can i consume", "should i consume",
        "how many pills", "how much to take", "treatment", "cure", "remedy", "therapy",
        "drug interaction", "side effect", "side effects", "overdose",
        "paracetamol", "acetaminophen", "ibuprofen", "aspirin", "lisinopril", "antibiotic", "antibiotics",
        "insulin", "metformin", "amoxicillin", "painkiller", "painkillers", "medicine", "medication",
        "fever", "headache", "chest pain", "symptom", "symptoms"
    );

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final RagAuditEventRepository audits;
    private final int topK;
    private final double threshold;
    private final String chatModel;
    private final String embeddingModel;

    public RagAssistantService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder,
                               RagAuditEventRepository audits,
                               @Value("${app.rag.top-k:4}") int topK,
                               @Value("${app.rag.similarity-threshold:0.10}") double threshold,
                               @Value("${spring.ai.google.genai.chat.model}") String chatModel,
                               @Value("${spring.ai.google.genai.embedding.text.model}") String embeddingModel) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
        this.audits = audits;
        this.topK = topK;
        this.threshold = threshold;
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
    }

    public RagDtos.RagAnswerResponse answer(RagDtos.RagQueryRequest request, AppUser user) {
        Instant startedAt = Instant.now();
        String query = request.query().trim();

        if (isOutOfScope(query)) {
            return recordedResponse(query,
                "I cannot provide diagnosis, medication, dosage, prescription, or treatment advice. Please contact a licensed clinician or the hospital emergency service as appropriate.",
                List.of(), RagResponseStatus.REFUSED_OUT_OF_SCOPE, null, user, startedAt);
        }

        List<Document> rawChunks;
        try {
            rawChunks = vectorStore.similaritySearch(SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(threshold)
                .build());
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "The retrieval service is unavailable. Please try again after the knowledge store is restored.");
        }

        if (rawChunks == null || rawChunks.isEmpty()) {
            return recordedResponse(query,
                "I could not find a sufficiently relevant approved hospital document for that question, so I will not guess. Please contact the relevant hospital desk.",
                List.of(), RagResponseStatus.ABSTAINED_NO_CONTEXT, null, user, startedAt);
        }

        List<Document> chunks = rawChunks.stream()
            .sorted(Comparator.comparing(doc -> {
                Double dist = asScore(doc.getMetadata().get("distance"));
                return dist == null ? 1.0 : dist;
            }))
            .toList();

        List<RagDtos.RagSource> sources = chunks.stream().map(this::toSource).toList();
        String context = buildContext(chunks, sources);
        String answer;
        try {
            answer = chatClient.prompt()
                .system("""
                    You are a hospital information retrieval assistant. Answer only from the supplied approved hospital-document context.
                    Do not diagnose, prescribe, recommend a medicine, or add facts that are not explicitly in context.
                    If context does not fully answer the question, say exactly: INSUFFICIENT_CONTEXT.
                    Keep the answer concise and informational. Do not mention a source that is not in the supplied context.
                    """)
                .user("Question: " + query + "\n\nApproved document context:\n" + context)
                .call()
                .content();
        } catch (Exception exception) {
            answer = extractGroundedAnswer(query, chunks, sources);
        }

        if (answer == null || answer.isBlank() || answer.contains("INSUFFICIENT_CONTEXT")) {
            return recordedResponse(query,
                "The retrieved documents do not contain enough information to answer safely, so I will not guess. Please contact the relevant hospital desk.",
                sources, RagResponseStatus.ABSTAINED_NO_CONTEXT, topScore(sources), user, startedAt);
        }
        return recordedResponse(query, answer.trim(), sources, RagResponseStatus.GROUNDED,
            topScore(sources), user, startedAt);
    }

    private RagDtos.RagAnswerResponse recordedResponse(String query, String answer, List<RagDtos.RagSource> sources,
                                                         RagResponseStatus status, Double score, AppUser user,
                                                         Instant startedAt) {
        long latency = Duration.between(startedAt, Instant.now()).toMillis();
        String documentIds = sources.stream().map(source -> source.id().toString()).distinct().collect(Collectors.joining(","));
        audits.save(new RagAuditEvent(UUID.randomUUID(), user.getId(), query, status, documentIds, score, latency, Instant.now()));
        return new RagDtos.RagAnswerResponse(query, answer, sources, Instant.now(), status.name(), score,
            chatModel, embeddingModel);
    }

    private RagDtos.RagSource toSource(Document chunk) {
        Map<String, Object> metadata = chunk.getMetadata();
        UUID documentId = UUID.fromString(String.valueOf(metadata.get("documentId")));
        Double rawDistance = asScore(metadata.get("distance"));
        // Spring AI SimpleVectorStore stores cosine distance (1.0 - similarity) in "distance".
        // Convert distance to true cosine similarity score: similarity = 1.0 - distance.
        Double similarity = rawDistance == null ? null : Math.max(0.0, Math.min(1.0, 1.0 - rawDistance));
        return new RagDtos.RagSource(
            documentId,
            String.valueOf(metadata.getOrDefault("title", "Approved hospital document")),
            String.valueOf(metadata.getOrDefault("documentType", "Hospital policy")),
            String.valueOf(metadata.getOrDefault("section", "Unspecified section")),
            similarity,
            excerpt(chunk.getText()),
            String.valueOf(metadata.getOrDefault("version", "Unspecified"))
        );
    }

    private String buildContext(List<Document> chunks, List<RagDtos.RagSource> sources) {
        List<String> blocks = new ArrayList<>();
        for (int index = 0; index < chunks.size(); index++) {
            RagDtos.RagSource source = sources.get(Math.min(index, sources.size() - 1));
            blocks.add("[DOC " + source.id() + " | " + source.documentName() + " | " + source.section() + "]\n" + chunks.get(index).getText());
        }
        return String.join("\n\n", blocks);
    }

    private boolean isOutOfScope(String query) {
        String normalized = query.toLowerCase(Locale.ROOT);
        return OUT_OF_SCOPE_TERMS.stream().anyMatch(normalized::contains);
    }

    private Double asScore(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        try { return value == null ? null : Double.parseDouble(value.toString()); }
        catch (NumberFormatException ignored) { return null; }
    }

    private Double topScore(List<RagDtos.RagSource> sources) {
        return sources.stream().map(RagDtos.RagSource::similarityScore)
            .filter(score -> score != null).max(Double::compareTo).orElse(null);
    }

    private String excerpt(String value) {
        String normalized = value.replaceAll("\\s+", " ").trim();
        return normalized.length() <= 360 ? normalized : normalized.substring(0, 360) + "…";
    }

    private static final Set<String> STOP_WORDS = Set.of(
        "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had", "her", "was", "one",
        "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two",
        "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use", "what", "when", "where",
        "which", "with", "have", "this", "that", "from", "they", "will", "would", "there", "their"
    );

    private boolean hasLexicalOverlap(String query, String text) {
        if (query == null || text == null) return false;
        String lowerText = text.toLowerCase(Locale.ROOT);
        String[] queryWords = query.toLowerCase(Locale.ROOT).split("[^a-zA-Z0-9]+");
        for (String word : queryWords) {
            if (word.length() >= 3 && !STOP_WORDS.contains(word)) {
                if (lowerText.contains(word)) {
                    return true;
                }
            }
        }
        return false;
    }

    private String extractGroundedAnswer(String query, List<Document> chunks, List<RagDtos.RagSource> sources) {
        if (chunks.isEmpty() || sources.isEmpty()) {
            return "Please consult the relevant hospital department for further guidance.";
        }
        String topText = chunks.get(0).getText().trim();
        if (!hasLexicalOverlap(query, topText)) {
            return "INSUFFICIENT_CONTEXT";
        }
        RagDtos.RagSource topSource = sources.get(0);
        return "Based on approved hospital records (" + topSource.documentName() + " — " + topSource.section() + "):\n\n" + topText;
    }
}
