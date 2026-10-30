package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.domain.DocumentStatus;
import com.apexcare.rag.domain.HospitalDocument;
import com.apexcare.rag.repository.HospitalDocumentRepository;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class KnowledgeDocumentService {
    private static final int CHUNK_SIZE = 1_400;
    private static final int CHUNK_OVERLAP = 200;

    private final HospitalDocumentRepository documents;
    private final VectorStore vectorStore;

    public KnowledgeDocumentService(HospitalDocumentRepository documents, VectorStore vectorStore) {
        this.documents = documents;
        this.vectorStore = vectorStore;
    }

    @Transactional
    public RagDtos.DocumentResponse createFromText(RagDtos.CreateDocumentRequest request, UUID createdBy) {
        return saveAndIndex(request.title(), request.category(), request.section(), request.version(),
            null, request.content(), createdBy);
    }

    @Transactional
    public RagDtos.DocumentResponse createFromFile(MultipartFile file, String title, String category, String section,
                                                    String version, UUID createdBy) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A non-empty PDF or TXT document is required.");
        }
        String fileName = file.getOriginalFilename();
        String text = extractText(file);
        return saveAndIndex(title, category, section, version, fileName, text, createdBy);
    }

    public List<RagDtos.DocumentResponse> list() {
        return documents.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    private RagDtos.DocumentResponse saveAndIndex(String title, String category, String section, String version,
                                                   String sourceFileName, String content, UUID createdBy) {
        String cleanContent = content == null ? "" : content.trim();
        if (cleanContent.length() < 80) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The document must contain at least 80 characters of approved policy text.");
        }
        String hash = sha256(cleanContent);
        if (documents.findByContentHash(hash).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "This document content has already been indexed.");
        }

        HospitalDocument document = new HospitalDocument(UUID.randomUUID(), title.trim(), category.trim(),
            blankToNull(section), blankToNull(sourceFileName), version.trim(), hash, cleanContent,
            DocumentStatus.FAILED, createdBy, Instant.now());
        documents.save(document);

        try {
            vectorStore.add(toChunks(document));
            document.markIndexed(Instant.now());
            documents.save(document);
            return toResponse(document);
        } catch (RuntimeException exception) {
            document.markFailed();
            documents.save(document);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "The document was saved but could not be embedded. Check pgvector and the embedding-model configuration.");
        }
    }

    private List<Document> toChunks(HospitalDocument document) {
        List<Document> chunks = new ArrayList<>();
        List<String> parts = split(document.getContent());
        for (int index = 0; index < parts.size(); index++) {
            Map<String, Object> metadata = new LinkedHashMap<>();
            metadata.put("documentId", document.getId().toString());
            metadata.put("title", document.getTitle());
            metadata.put("documentType", document.getDocumentType());
            metadata.put("section", document.getSectionLabel() == null ? "Unspecified section" : document.getSectionLabel());
            metadata.put("version", document.getDocumentVersion());
            metadata.put("chunkIndex", index);
            chunks.add(new Document(parts.get(index), metadata));
        }
        return chunks;
    }

    private List<String> split(String content) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < content.length()) {
            int end = Math.min(content.length(), start + CHUNK_SIZE);
            if (end < content.length()) {
                int boundary = Math.max(content.lastIndexOf('\n', end), content.lastIndexOf(' ', end));
                if (boundary > start + CHUNK_SIZE / 2) {
                    end = boundary;
                }
            }
            String chunk = content.substring(start, end).trim();
            if (!chunk.isEmpty()) chunks.add(chunk);
            if (end >= content.length()) break;
            start = Math.max(end - CHUNK_OVERLAP, start + 1);
        }
        return chunks;
    }

    private String extractText(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        try {
            if (name.endsWith(".txt") || "text/plain".equalsIgnoreCase(file.getContentType())) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
            if (name.endsWith(".pdf") || "application/pdf".equalsIgnoreCase(file.getContentType())) {
                try (PDDocument pdf = PDDocument.load(new ByteArrayInputStream(file.getBytes()))) {
                    return new PDFTextStripper().getText(pdf);
                }
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The uploaded document could not be read.");
        }
        throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF and UTF-8 TXT policy documents are supported.");
    }

    private RagDtos.DocumentResponse toResponse(HospitalDocument document) {
        String snippet = "";
        if (document.getContent() != null && !document.getContent().isBlank()) {
            int len = Math.min(220, document.getContent().length());
            snippet = document.getContent().substring(0, len).trim() + (document.getContent().length() > 220 ? "..." : "");
        }
        return new RagDtos.DocumentResponse(document.getId(), document.getTitle(), document.getDocumentType(),
            document.getSectionLabel(), document.getDocumentVersion(), document.getSourceFileName(),
            document.getStatus().name(), document.getCreatedAt(), document.getIndexedAt(), snippet);
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
