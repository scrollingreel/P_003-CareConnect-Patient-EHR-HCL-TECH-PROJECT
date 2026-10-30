CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hospital_documents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    section_label VARCHAR(255),
    source_file_name VARCHAR(255),
    document_version VARCHAR(100) NOT NULL,
    content_hash CHAR(64) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_by UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE rag_audit_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id),
    question TEXT NOT NULL,
    response_status VARCHAR(30) NOT NULL,
    source_document_ids TEXT NOT NULL,
    top_score DOUBLE PRECISION,
    latency_ms BIGINT NOT NULL,
    feedback VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX rag_audit_events_created_at_idx ON rag_audit_events(created_at DESC);
CREATE INDEX hospital_documents_status_idx ON hospital_documents(status);
