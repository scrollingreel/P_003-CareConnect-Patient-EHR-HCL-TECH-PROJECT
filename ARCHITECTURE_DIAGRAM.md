# ApexCare Hospital Management System — Architecture Diagram
### System: React 18 SPA + Spring Boot 3.5.7 + RAG Pipeline (Gemini 2.5 Flash / TF-Hash Embedding / SimpleVectorStore)

---

## 1. Complete System Architecture Diagram

```mermaid
graph TB
    subgraph BROWSER["🌐 Frontend Client (React 18 + Vite 5.4)"]
        subgraph UI_LAYER["User Interface Pages"]
            PATIENT_UI["Patient Portal<br/>Dashboard, Appointments,<br/>Prescriptions, Records"]
            DOCTOR_UI["Doctor Portal<br/>Dashboard, Patient List,<br/>Patient Chart, Schedule"]
            ADMIN_UI["Admin Portal<br/>Analytics Dashboard"]
        end

        subgraph STATE_RAG["Application Context & Components"]
            AUTH_CTX["AuthContext.jsx<br/>Session JWT State<br/>(Auto-inits Sarah Jenkins in demo)"]
            ASST_CTX["AssistantContext.jsx<br/>RAG Drawer State & Messages"]
            RAG_DRAWER["RagAssistantDrawer.jsx<br/>Chat Drawer + Source Citation Modal"]
            PROT_ROUTE["ProtectedRoute.jsx<br/>Frontend Role-Based Access Control"]
        end

        subgraph API_CLIENT_LAYER["API Client Layer (src/api/)"]
            AXIOS["client.js<br/>Axios Client with Bearer JWT Interceptor"]
            MODE_SWITCH{{"VITE_USE_MOCK<br/>Mode Evaluator"}}
            MOCK_STORE["mockData.js<br/>In-Memory Mock Stores &<br/>Lexical Keyword RAG"]
        end
    end

    subgraph BACKEND["☕ Backend Service (Spring Boot 3.5.7 :8080/api)"]
        subgraph SEC_LAYER["Security Layer"]
            JWT_FILTER["JwtAuthenticationFilter<br/>Parses & Validates JJWT"]
            SEC_CONFIG["SecurityConfig.java<br/>⚠ .permitAll() on all endpoints<br/>(No backend RBAC enforcement)"]
        end

        subgraph REST_CTRL["REST Controllers"]
            AUTH_CTRL["AuthController<br/>/auth/login, /auth/register, /auth/me"]
            RAG_CTRL["RagAssistantController<br/>POST /rag-assistant/query"]
            DOC_CTRL["KnowledgeDocumentController<br/>/rag-assistant/policies"]
            ANALYTICS_CTRL["AnalyticsController<br/>/analytics/kpis, /analytics/rag-comparison"]
            HOSP_CTRLS["Hospital Controllers<br/>Appointments, Doctors, Departments, Patients"]
        end

        subgraph RAG_CORE["RAG Service Engine (RagAssistantService.java)"]
            CLINICAL_FILTER["1. Clinical Decision Safety Filter<br/>11 blocked terms (diagnose, dosage, etc.)"]
            VECTOR_SEARCH["2. VectorStore.similaritySearch()<br/>topK=4, similarityThreshold=0.10"]
            CTX_BUILDER["3. Context Builder<br/>Formats [DOC id | title | section] chunks"]
            LLM_INVOKER["4. ChatClient Prompt Invocation<br/>Gemini 2.5 Flash (temp=0.0, maxTokens=700)"]
            FALLBACK_EXTRACTOR["5. Fallback Extractor<br/>extractGroundedAnswer() on LLM failure"]
            AUDIT_LOGGER["6. Audit Logger<br/>Persists query, status, latency to DB"]
        end

        subgraph VECTOR_ENGINE["Vector Store & Embedding Engine (VectorStoreConfig.java)"]
            TF_EMBED["⚠ EmbeddingModel Bean<br/>Bag-of-Words TF Hash Bucketing<br/>768-dim L2-normalized float[]<br/>(NOT text-embedding-004)"]
            SIMPLE_VS["⚠ VectorStore Bean<br/>SimpleVectorStore (In-Memory)<br/>(NOT pgvector)"]
        end

        subgraph INGEST_ENGINE["Document Ingestion Engine (KnowledgeDocumentService.java)"]
            PDF_STRIPPER["Apache PDFBox 2.0.32<br/>PDF Text Stripping"]
            CHUNKER["Sliding Window Chunker<br/>1400 chars chunk / 200 chars overlap"]
            SHA_DEDUP["SHA-256 Deduplication Hash"]
        end

        subgraph SERVICES_CORE["Core Services"]
            AUTH_SVC["AuthService.java<br/>BCrypt + User Loading"]
            JWT_SVC["JwtService.java<br/>HMAC-SHA256 Token Issuer/Parser"]
        end
    end

    subgraph DATA_TIER["💾 Persistence Tier"]
        H2_DB[("H2 Embedded Database<br/>./data/apexcare.mv.db (118 KB)<br/>Flyway V1 + V2 Schemas")]
        PG_VECTOR_EXCL[("PostgreSQL / pgvector<br/>❌ EXCLUDED via autoconfigure")]
        GOOGLE_EMBED_EXCL[("Google GenAI Embedding<br/>❌ EXCLUDED via autoconfigure")]
    end

    subgraph CLOUD_AI["☁️ External Cloud AI"]
        GEMINI_API["Google Gemini 2.5 Flash API<br/>⚠ GEMINI_API_KEY default is mock<br/>(Requires valid Google AI Key)"]
    end

    subgraph SEED_SYSTEM["🌱 Startup Initialization"]
        DATA_SEEDER["DataSeeder.java (@PostConstruct)<br/>Seeds 3 Users, 6 Depts, 5 Doctors, 4 Patients,<br/>5 Hospital Policy Documents into DB & VectorStore"]
    end

    %% Wiring connections
    UI_LAYER --> PROT_ROUTE
    PROT_ROUTE --> AUTH_CTX
    UI_LAYER --> ASST_CTX
    ASST_CTX --> RAG_DRAWER
    UI_LAYER --> AXIOS
    ASST_CTX --> AXIOS

    AXIOS --> MODE_SWITCH
    MODE_SWITCH -->|VITE_USE_MOCK = true| MOCK_STORE
    MODE_SWITCH -->|VITE_USE_MOCK = false| JWT_FILTER

    JWT_FILTER --> SEC_CONFIG
    SEC_CONFIG --> REST_CTRL

    AUTH_CTRL --> AUTH_SVC
    AUTH_SVC --> JWT_SVC
    AUTH_SVC --> H2_DB

    RAG_CTRL --> CLINICAL_FILTER
    CLINICAL_FILTER -->|Clinical Query| RAG_CTRL
    CLINICAL_FILTER -->|Valid Query| VECTOR_SEARCH

    VECTOR_SEARCH --> SIMPLE_VS
    SIMPLE_VS --> TF_EMBED
    SIMPLE_VS --> CTX_BUILDER

    CTX_BUILDER --> LLM_INVOKER
    LLM_INVOKER --> GEMINI_API
    LLM_INVOKER -.->|On Key Error/Failure| FALLBACK_EXTRACTOR

    FALLBACK_EXTRACTOR --> AUDIT_LOGGER
    LLM_INVOKER --> AUDIT_LOGGER
    AUDIT_LOGGER --> H2_DB

    DOC_CTRL --> PDF_STRIPPER
    PDF_STRIPPER --> CHUNKER
    CHUNKER --> SHA_DEDUP
    SHA_DEDUP --> H2_DB
    SHA_DEDUP --> SIMPLE_VS

    DATA_SEEDER --> H2_DB
    DATA_SEEDER --> SIMPLE_VS
```

---

## 2. RAG Execution Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Patient
    participant UI as RagAssistantDrawer (React)
    participant API as RagAssistantController
    participant RAG as RagAssistantService
    participant VS as SimpleVectorStore
    participant TF as TF-Hash EmbeddingModel
    participant LLM as Gemini 2.5 Flash (Spring AI)
    participant DB as H2 Database (rag_audit_events)

    User->>UI: Types query: "What are the visiting hours for cardiology?"
    UI->>API: POST /api/rag-assistant/query { query }
    API->>RAG: assistant.answer(request, currentUser)
    
    rect rgb(240, 248, 255)
        note over RAG: Layer 1: Safety Blocklist Evaluation
        RAG->>RAG: Check against CLINICAL_DECISION_TERMS
    end

    rect rgb(255, 250, 240)
        note over RAG,VS: Layer 2: Vector Retrieval & Similarity Search
        RAG->>VS: similaritySearch(topK=4, threshold=0.10)
        VS->>TF: embed(query)
        TF-->>VS: 768-dim float vector (L2-normalized)
        VS->>VS: Compute cosine similarity against in-memory chunk vectors
        VS-->>RAG: List<Document> matching chunks
    end

    alt No chunks returned (score < 0.10)
        RAG->>DB: Save RagAuditEvent(ABSTAINED_NO_CONTEXT)
        RAG-->>API: RagAnswerResponse (Status: ABSTAINED_NO_CONTEXT)
        API-->>UI: Display abstention message
    else Relevant chunks found
        rect rgb(245, 255, 245)
            note over RAG: Layer 3: Context Assembly
            RAG->>RAG: buildContext(chunks) -> formatted [DOC id | title | section]
        end

        rect rgb(255, 245, 255)
            note over RAG,LLM: Layer 4: Strict Grounded Generation
            RAG->>LLM: chatClient.prompt().user(context + query).call()
            alt Valid API Key & Success
                LLM-->>RAG: Generated grounded answer
            else Invalid Key / Quota Exceeded / Error
                note over RAG: Fallback mechanism triggers
                RAG->>RAG: extractGroundedAnswer(chunks, query) -> Excerpt from top chunk
            end
        end

        alt Answer contains "INSUFFICIENT_CONTEXT"
            RAG->>DB: Save RagAuditEvent(ABSTAINED_INSUFFICIENT_CONTEXT)
            RAG-->>API: Return Abstention Response
        else Grounded Answer Ready
            RAG->>RAG: buildSources(chunks) -> List<RagSource>
            RAG->>DB: Save RagAuditEvent(GROUNDED, topScore, latencyMs)
            RAG-->>API: RagAnswerResponse (GROUNDED, answer, sources)
        end

        API-->>UI: 200 OK with Answer + Citations
        UI-->>User: Renders answer badge, text, and clickable source pills
    end
```

---

## 3. Data Storage and Model Diagram

```mermaid
erDiagram
    APP_USERS ||--o{ HOSPITAL_DOCUMENTS : "indexes"
    APP_USERS ||--o{ RAG_AUDIT_EVENTS : "executes"
    APP_USERS ||--o| PATIENT_PROFILES : "identifies"
    DEPARTMENTS ||--o{ DOCTORS : "employs"
    DOCTORS ||--o{ APPOINTMENTS : "conducts"
    PATIENT_PROFILES ||--o{ APPOINTMENTS : "books"
    DOCTORS ||--o{ PRESCRIPTIONS : "prescribes"
    PATIENT_PROFILES ||--o{ PRESCRIPTIONS : "receives"
    PATIENT_PROFILES ||--o{ PATIENT_VITALS : "monitored"
    PATIENT_PROFILES ||--o{ CLINICAL_NOTES : "charted"
    PATIENT_PROFILES ||--o{ PATIENT_REPORTS : "diagnostics"

    APP_USERS {
        UUID id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR role
        TIMESTAMP created_at
    }

    HOSPITAL_DOCUMENTS {
        UUID id PK
        VARCHAR title
        VARCHAR document_type
        VARCHAR section_label
        VARCHAR source_file_name
        VARCHAR document_version
        CHAR content_hash UK
        TEXT content
        VARCHAR status
        UUID created_by FK
        TIMESTAMP created_at
        TIMESTAMP indexed_at
    }

    RAG_AUDIT_EVENTS {
        UUID id PK
        UUID user_id FK
        TEXT question
        VARCHAR response_status
        TEXT source_document_ids
        DOUBLE top_score
        BIGINT latency_ms
        VARCHAR feedback
        TIMESTAMP created_at
    }
```
