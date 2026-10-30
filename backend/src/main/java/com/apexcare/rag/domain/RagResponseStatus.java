package com.apexcare.rag.domain;

public enum RagResponseStatus {
    GROUNDED,
    ABSTAINED_NO_CONTEXT,
    REFUSED_OUT_OF_SCOPE,
    GENERATION_FAILED
}
