# ApexCare RAG Implementation — Source Code & Logic Walkthrough
### Comprehensive code reference for RAG ingestion, embedding, vector retrieval, and safety abstention

---

## 1. Overview of the RAG Architecture

The ApexCare RAG system contains two distinct execution tiers:
1. **Backend Real Mode (Spring Boot + Spring AI):**
   - **Ingestion:** `KnowledgeDocumentService.java` chunks documents (1400 chars with 200 char overlap) and computes SHA-256 deduplication hashes.
   - **Embedding Engine:** `VectorStoreConfig.java` defines a bag-of-words token frequency (TF) hash-bucketing embedding model returning a 768-dimensional L2-normalized float vector.
   - **Vector Store:** `SimpleVectorStore` (Spring AI's in-memory cosine similarity store).
   - **Safety & Generation:** `RagAssistantService.java` checks queries against clinical decision terms (`CLINICAL_DECISION_TERMS`), queries the vector store, constructs context, and prompts Gemini 2.5 Flash (`chatClient`). If the API key is missing or fails, it activates a deterministic text fallback (`extractGroundedAnswer`).
   - **Audit Logging:** Logs all query latencies, retrieved document IDs, scores, and statuses to the `rag_audit_events` H2 database table.

2. **Frontend Demonstration Mode (React/JS):**
   - `mockData.js` contains `generateRagResponseForQuery()`, a pure JavaScript lexical keyword ranker used when `VITE_USE_MOCK=true`.

---

## 2. Core Backend Code: `RagAssistantService.java`
**File Location:** `backend/src/main/java/com/apexcare/rag/service/RagAssistantService.java`

```java
package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.domain.AppUser;
import com.apexcare.rag.domain.RagAuditEvent;
import com.apexcare.rag.domain.ResponseStatus;
import com.apexcare.rag.repository.RagAuditEventRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RagAssistantService {

    // ── CLINICAL DECISION SAFETY BLOCKLIST ────────────────────────────────
    // Any query containing clinical/prescription keywords is halted immediately
    private static final List<String> CLINICAL_DECISION_TERMS = List.of(
        "diagnose", "diagnosis", "dosage", "dose",
        "prescribe", "prescription",
        "drug interaction",
        "symptom", "treatment",
        "should i take", "can i take"
    );

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final RagAuditEventRepository auditRepo;
    private final int topK;
    private final double similarityThreshold;

    public RagAssistantService(
        VectorStore vectorStore,
        ChatClient.Builder chatClientBuilder,
        RagAuditEventRepository auditRepo,
        @Value("${app.rag.top-k:4}") int topK,
        @Value("${app.rag.similarity-threshold:0.10}") double similarityThreshold
    ) {
        this.vectorStore = vectorStore;
        // Strict grounding constraint baked into LLM system prompt
        this.chatClient = chatClientBuilder
            .defaultSystem("""
                You are a hospital information retrieval assistant for ApexCare Hospital.
                Answer ONLY from the supplied approved hospital-document context marked with [DOC ...].
                If the context does not contain enough information, respond with exactly:
                INSUFFICIENT_CONTEXT
                Do not diagnose, prescribe, or give medical advice.
                Do not use external knowledge. Be concise and factual.
                """)
            .build();
        this.auditRepo = auditRepo;
        this.topK = topK;
        this.similarityThreshold = similarityThreshold;
    }

    public RagDtos.RagAnswerResponse answer(RagDtos.RagQueryRequest request, AppUser user) {
        long start = System.currentTimeMillis();
        String query = request.query().trim();

        // 1. Check clinical decision guard
        if (isClinicalDecision(query)) {
            saveAudit(user, query, ResponseStatus.REFUSED_OUT_OF_SCOPE, List.of(), null, start);
            return refused(query);
        }

        // 2. Vector similarity retrieval
        List<Document> chunks;
        try {
            chunks = vectorStore.similaritySearch(
                SearchRequest.builder()
                    .query(query)
                    .topK(topK)
                    .similarityThreshold(similarityThreshold)
                    .build()
            );
        } catch (RuntimeException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "The knowledge retrieval service is temporarily unavailable.");
        }

        // 3. Abstain if no chunks found
        if (chunks == null || chunks.isEmpty()) {
            saveAudit(user, query, ResponseStatus.ABSTAINED_NO_CONTEXT, List.of(), null, start);
            return abstained(query, "The knowledge base does not contain sufficient context " +
                "to answer this question. Please contact the hospital help desk.");
        }

        // 4. Assemble context from chunks
        String context = buildContext(chunks);

        // 5. Invoke LLM generation with fallback
        String answer;
        try {
            answer = chatClient.prompt()
                .user(u -> u.text("Context:\n" + context + "\n\nQuestion: " + query))
                .call()
                .content();
        } catch (Exception e) {
            // Fallback path if GEMINI_API_KEY is invalid or network fails
            answer = extractGroundedAnswer(chunks, query);
        }

        // 6. Check if LLM opted to abstain
        if (answer != null && answer.contains("INSUFFICIENT_CONTEXT")) {
            saveAudit(user, query, ResponseStatus.ABSTAINED_INSUFFICIENT_CONTEXT, chunks, null, start);
            return abstained(query, "I could not find a definitive answer in the " +
                "approved documents. Please consult the hospital help desk.");
        }

        // 7. Extract citations and scores
        List<RagDtos.RagSource> sources = buildSources(chunks);
        double topScore = chunks.stream()
            .mapToDouble(d -> {
                Object s = d.getMetadata().get("distance");
                return s instanceof Number ? ((Number) s).doubleValue() : 0.0;
            })
            .max().orElse(0.0);

        saveAudit(user, query, ResponseStatus.GROUNDED, chunks, topScore, start);

        return new RagDtos.RagAnswerResponse(
            query,
            answer,
            sources,
            Instant.now(),
            ResponseStatus.GROUNDED.name(),
            topScore,
            "gemini-2.5-flash",
            "apexcare-tf-hash-768"
        );
    }

    private boolean isClinicalDecision(String query) {
        String lower = query.toLowerCase();
        return CLINICAL_DECISION_TERMS.stream().anyMatch(lower::contains);
    }

    private String buildContext(List<Document> chunks) {
        StringBuilder sb = new StringBuilder();
        for (Document doc : chunks) {
            Map<String, Object> meta = doc.getMetadata();
            sb.append("[DOC ").append(meta.get("documentId"))
              .append(" | ").append(meta.get("title"))
              .append(" | ").append(meta.get("section"))
              .append("]\n")
              .append(doc.getText()).append("\n\n");
        }
        return sb.toString().trim();
    }

    private String extractGroundedAnswer(List<Document> chunks, String query) {
        if (chunks.isEmpty()) return "Information not available.";
        String text = chunks.get(0).getText();
        String[] sentences = text.split("(?<=[.!?])\\s+");
        String lower = query.toLowerCase();
        for (String sentence : sentences) {
            if (Arrays.stream(lower.split("\\s+")).anyMatch(w -> sentence.toLowerCase().contains(w))) {
                return sentence.trim();
            }
        }
        return text.substring(0, Math.min(400, text.length())).trim() + "...";
    }

    private List<RagDtos.RagSource> buildSources(List<Document> chunks) {
        List<RagDtos.RagSource> sources = new ArrayList<>();
        for (Document doc : chunks) {
            Map<String, Object> meta = doc.getMetadata();
            String snippet = doc.getText();
            if (snippet.length() > 300) snippet = snippet.substring(0, 300) + "...";
            Object rawScore = meta.get("distance");
            double score = rawScore instanceof Number ? ((Number) rawScore).doubleValue() : 0.0;
            sources.add(new RagDtos.RagSource(
                meta.get("documentId") != null ? UUID.fromString(meta.get("documentId").toString()) : null,
                (String) meta.get("title"),
                (String) meta.get("documentType"),
                (String) meta.get("section"),
                score,
                snippet,
                (String) meta.get("version")
            ));
        }
        return sources;
    }

    private void saveAudit(AppUser user, String query, ResponseStatus status,
                           List<Document> chunks, Double topScore, long start) {
        try {
            String docIds = chunks.stream()
                .map(d -> String.valueOf(d.getMetadata().get("documentId")))
                .filter(s -> !s.equals("null"))
                .distinct()
                .reduce("", (a, b) -> a.isEmpty() ? b : a + "," + b);
            auditRepo.save(new RagAuditEvent(
                UUID.randomUUID(),
                user.getId(),
                query,
                status,
                docIds,
                topScore,
                System.currentTimeMillis() - start,
                null
            ));
        } catch (Exception ignored) {}
    }

    private RagDtos.RagAnswerResponse refused(String query) {
        return new RagDtos.RagAnswerResponse(query,
            "I cannot provide diagnosis, medication, dosage, or treatment advice. " +
            "Please consult your treating physician or the hospital pharmacy directly.",
            List.of(), Instant.now(), ResponseStatus.REFUSED_OUT_OF_SCOPE.name(),
            null, "apexcare-safety-filter", "n/a");
    }

    private RagDtos.RagAnswerResponse abstained(String query, String reason) {
        return new RagDtos.RagAnswerResponse(query, reason,
            List.of(), Instant.now(), ResponseStatus.ABSTAINED_NO_CONTEXT.name(),
            null, "apexcare-abstention", "n/a");
    }
}
```

---

## 3. Vector Store & Embedding: `VectorStoreConfig.java`
**File Location:** `backend/src/main/java/com/apexcare/rag/config/VectorStoreConfig.java`

```java
package com.apexcare.rag.config;

import java.util.List;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class VectorStoreConfig {

    @Value("${spring.ai.google.genai.embedding.options.model:text-embedding-004}")
    private String embeddingModelName;

    /**
     * Term Frequency (TF) Hash Bucketing Embedding Model.
     * Generates a 768-dimensional normalized vector without external API calls.
     */
    @Bean
    @Primary
    public EmbeddingModel embeddingModel() {
        return new EmbeddingModel() {
            private static final int DIMS = 768;

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                List<Embedding> embeddings = request.getInstructions().stream()
                    .map(text -> new Embedding(embed(text), 0))
                    .toList();
                return new EmbeddingResponse(embeddings);
            }

            @Override
            public float[] embed(Document document) {
                return embed(document.getText());
            }

            private float[] embed(String text) {
                float[] vector = new float[DIMS];
                String[] tokens = text.toLowerCase().split("[^a-z0-9]+");

                for (String token : tokens) {
                    if (token.length() < 3) continue;
                    int bucket = Math.abs(token.hashCode()) % DIMS;
                    vector[bucket] += 1.0f;
                }

                float norm = 0f;
                for (float v : vector) norm += v * v;
                norm = (float) Math.sqrt(norm);
                if (norm > 0) {
                    for (int i = 0; i < DIMS; i++) vector[i] /= norm;
                }
                return vector;
            }

            @Override
            public int dimensions() { return DIMS; }
        };
    }

    /**
     * In-memory vector store bean.
     */
    @Bean
    @Primary
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }
}
```

---

## 4. Ingestion & Document Pipeline: `KnowledgeDocumentService.java`
**File Location:** `backend/src/main/java/com/apexcare/rag/service/KnowledgeDocumentService.java`

```java
package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.domain.DocumentStatus;
import com.apexcare.rag.domain.HospitalDocument;
import com.apexcare.rag.repository.HospitalDocumentRepository;
import java.io.IOException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class KnowledgeDocumentService {

    private static final int CHUNK_SIZE = 1400;
    private static final int OVERLAP    = 200;

    private final HospitalDocumentRepository repo;
    private final VectorStore vectorStore;

    public KnowledgeDocumentService(HospitalDocumentRepository repo, VectorStore vectorStore) {
        this.repo = repo;
        this.vectorStore = vectorStore;
    }

    public RagDtos.DocumentResponse createFromFile(
        MultipartFile file, String title, String category,
        String section, String version, UUID uploaderId
    ) {
        String content;
        try {
            String contentType = file.getContentType();
            if (contentType != null && contentType.contains("pdf")) {
                try (PDDocument pdf = PDDocument.load(file.getInputStream())) {
                    content = new PDFTextStripper().getText(pdf);
                }
            } else {
                content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read file: " + e.getMessage());
        }

        return ingest(title, category, section,
            version != null && !version.isBlank() ? version : "1.0",
            file.getOriginalFilename(), content, uploaderId);
    }

    private RagDtos.DocumentResponse ingest(
        String title, String category, String section, String version,
        String fileName, String content, UUID uploaderId
    ) {
        String hash = sha256(content);
        if (repo.existsByContentHash(hash)) {
            throw new ApiException(HttpStatus.CONFLICT, "Duplicate document content detected.");
        }

        HospitalDocument doc = new HospitalDocument(
            UUID.randomUUID(), title, category, section, fileName, version,
            hash, content, DocumentStatus.INDEXED, uploaderId, Instant.now()
        );
        doc.setIndexedAt(Instant.now());
        repo.save(doc);

        try {
            List<Document> chunks = split(content, doc);
            vectorStore.add(chunks);
        } catch (Exception e) {
            doc.setStatus(DocumentStatus.FAILED);
            repo.save(doc);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Indexing failed: " + e.getMessage());
        }

        return toResponse(doc);
    }

    /**
     * Sliding-window text chunker with newline and space boundary fallback.
     */
    private List<Document> split(String content, HospitalDocument doc) {
        List<Document> chunks = new ArrayList<>();
        int len = content.length();
        int start = 0;

        while (start < len) {
            int end = Math.min(start + CHUNK_SIZE, len);

            if (end < len) {
                int boundary = content.lastIndexOf('\n', end);
                if (boundary <= start) boundary = content.lastIndexOf(' ', end);
                if (boundary > start) end = boundary;
            }

            String chunkText = content.substring(start, end).trim();

            if (!chunkText.isBlank()) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("documentId", doc.getId().toString());
                metadata.put("title", doc.getTitle());
                metadata.put("documentType", doc.getDocumentType());
                metadata.put("section", doc.getSectionLabel());
                metadata.put("version", doc.getDocumentVersion());
                chunks.add(new Document(chunkText, metadata));
            }

            start = end - OVERLAP;
            if (start >= end) start = end;
        }

        return chunks;
    }

    private String sha256(String input) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                .digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    private RagDtos.DocumentResponse toResponse(HospitalDocument doc) {
        String snippet = doc.getContent();
        if (snippet != null && snippet.length() > 200) snippet = snippet.substring(0, 200) + "...";
        return new RagDtos.DocumentResponse(
            doc.getId(), doc.getTitle(), doc.getDocumentType(),
            doc.getSectionLabel(), doc.getDocumentVersion(),
            doc.getSourceFileName(), doc.getStatus().name(),
            doc.getCreatedAt(), doc.getIndexedAt(), snippet
        );
    }
}
```

---

## 5. Frontend Client Retrieval: `generateRagResponseForQuery()`
**File Location:** `src/api/mockData.js` (Lines 733–828)

```javascript
export const generateRagResponseForQuery = (query) => {
  const queryLower = query.toLowerCase().trim();
  const queryTerms = normaliseTerms(query);

  // Layer 1: Clinical decision filter
  if (CLINICAL_DECISION_TERMS.some(term => queryLower.includes(term))) {
    return {
      answer: 'I cannot provide diagnosis, medication, dosage, prescription, ' +
              'or treatment advice. Please consult your treating physician or ' +
              'the hospital pharmacy directly for clinical guidance.',
      sources: [],
      retrievalStatus: 'REFUSED_OUT_OF_SCOPE',
      retrievalScore: 0,
      model: 'Mock retrieval demo — no LLM invoked',
      mode: 'mock-clinical-safety-block'
    };
  }

  if (queryTerms.length === 0) {
    return abstainedResponse(query);
  }

  // Layer 2: Lexical scoring across mock corpus
  const ranked = MOCK_RAG_CORPUS
    .map(entry => ({ entry, score: scoreEntry(queryTerms, queryLower, entry) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  // Layer 3: Score threshold cutoff (0.34)
  if (!best || best.score < SIMILARITY_THRESHOLD) {
    return abstainedResponse(query);
  }

  // Layer 4: Return matched entry with citations
  return {
    query,
    answer: best.entry.answer,
    sources: best.entry.sources.map(s => ({
      documentName: s.documentName,
      section: s.section,
      snippet: best.entry.answer.substring(0, 200),
      similarityScore: parseFloat(best.score.toFixed(2))
    })),
    retrievalStatus: 'GROUNDED',
    retrievalScore: parseFloat(best.score.toFixed(2)),
    model: 'Mock retrieval demo — no LLM invoked',
    embeddingModel: 'Keyword matching — no real embedding',
    mode: 'mock-retrieval-demo',
    timestamp: new Date().toISOString()
  };
};
```
