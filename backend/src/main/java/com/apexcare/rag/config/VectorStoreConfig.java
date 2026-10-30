package com.apexcare.rag.config;

import java.util.*;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class VectorStoreConfig {

    @Bean
    @Primary
    public EmbeddingModel embeddingModel() {
        return new EmbeddingModel() {
            private static final int DIMENSIONS = 768;

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                List<Embedding> list = new ArrayList<>();
                for (int i = 0; i < request.getInstructions().size(); i++) {
                    list.add(new Embedding(embed(request.getInstructions().get(i)), i));
                }
                return new EmbeddingResponse(list);
            }

            @Override
            public float[] embed(Document document) {
                String meta = "";
                if (document.getMetadata() != null) {
                    meta = String.valueOf(document.getMetadata().getOrDefault("title", "")) + " " +
                           String.valueOf(document.getMetadata().getOrDefault("section", ""));
                }
                return embed(document.getText() + " " + meta);
            }

            @Override
            public float[] embed(String text) {
                float[] vector = new float[DIMENSIONS];
                if (text == null || text.isBlank()) return vector;

                String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-zA-Z0-9]+");
                for (String token : tokens) {
                    if (token.length() < 3) continue;
                    int bucket = Math.abs(token.hashCode()) % DIMENSIONS;
                    vector[bucket] += 1.0f;
                }

                float normSq = 0.0f;
                for (float v : vector) {
                    normSq += v * v;
                }
                if (normSq > 0) {
                    float norm = (float) Math.sqrt(normSq);
                    for (int i = 0; i < vector.length; i++) {
                        vector[i] /= norm;
                    }
                }
                return vector;
            }

            @Override
            public int dimensions() {
                return DIMENSIONS;
            }
        };
    }

    @Bean
    @Primary
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }
}
