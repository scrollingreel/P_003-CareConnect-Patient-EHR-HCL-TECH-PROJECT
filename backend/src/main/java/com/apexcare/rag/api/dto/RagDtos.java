package com.apexcare.rag.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class RagDtos {
    private RagDtos() {}

    public record RagQueryRequest(@NotBlank @Size(max = 2000) String query, String conversationId) {}

    public record RagSource(
        UUID id,
        String documentName,
        String documentType,
        String section,
        Double similarityScore,
        String snippet,
        String documentVersion
    ) {}

    public record RagAnswerResponse(
        String query,
        String answer,
        List<RagSource> sources,
        Instant timestamp,
        String retrievalStatus,
        Double retrievalScore,
        String model,
        String embeddingModel
    ) {}

    public record CreateDocumentRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 100) String category,
        @Size(max = 255) String section,
        String version,
        @NotBlank @Size(max = 500000) String content
    ) {
        public CreateDocumentRequest {
            if (version == null || version.isBlank()) {
                version = "1.0";
            }
        }
    }

    public record DocumentResponse(
        UUID id,
        String title,
        String type,
        String section,
        String version,
        String sourceFileName,
        String status,
        Instant createdAt,
        Instant indexedAt,
        String snippet
    ) {}
}
