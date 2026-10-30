import { apiClient, USE_MOCK, simulateDelay } from './client';
import { generateRagResponseForQuery } from './mockData';
import { recordAiQuery } from './aiTelemetryStore';

export const SUGGESTED_PROMPTS = [
  {
    category: 'Hospital Policies',
    query: 'What are the visiting hours for the cardiology department?'
  },
  {
    category: 'Diagnostic Preparation',
    query: 'What should a patient do to prepare for an MRI scan with contrast?'
  },
  {
    category: 'Doctor Timings',
    query: 'What are Dr. Rajesh Verma OPD consulting timings and room number?'
  },
  {
    category: 'Billing & Insurance',
    query: 'What is the hospital policy on emergency admissions and insurance pre-authorization?'
  },
  {
    category: 'Medication Safety',
    query: 'Can NSAIDs like Ibuprofen be taken concurrently with Lisinopril?'
  }
];

export const ragAssistantApi = {
  /**
   * Submit natural-language question to RAG pipeline
   * Spring Boot contract: POST /api/rag-assistant/query
   * Request: { query: string, conversationId?: string }
   * Response: { answer: string, sources: [{ documentName, section, similarityScore, snippet }] }
   */
  async query({ query, conversationId = null }) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/rag-assistant/query', { query, conversationId });
      return res.data;
    }

    const startedAt = performance.now();
    // Simulated transport delay for the frontend-only demo.
    await simulateDelay(650);

    const result = generateRagResponseForQuery(query);
    const response = {
      query,
      answer: result.answer,
      sources: result.sources,
      timestamp: new Date().toISOString(),
      retrievalStatus: result.retrievalStatus,
      retrievalScore: result.retrievalScore,
      mode: result.mode,
      // These fields document the target production integration; they do not
      // claim that the mock frontend called either service.
      model: 'Mock retrieval demo — no LLM invoked',
      embeddingModel: 'Mock lexical retrieval — no embeddings invoked'
    };
    recordAiQuery({
      query,
      latencyMs: performance.now() - startedAt,
      sourceCount: response.sources?.length || 0,
      status: response.retrievalStatus,
      retrievalScore: response.retrievalScore
    });
    return response;
  },

  /**
   * Get suggested starter questions
   */
  async getSuggestions() {
    return SUGGESTED_PROMPTS;
  },

  /**
   * Get all indexed hospital policy documents
   * Spring Boot contract: GET /api/rag-assistant/policies
   */
  async getHospitalPolicies() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/rag-assistant/policies');
      return res.data;
    }
    await simulateDelay(300);
    const { getHospitalPolicyDocuments } = await import('./mockData');
    return getHospitalPolicyDocuments();
  },

  /**
   * Upload or add a new hospital policy document to the vector store
   * Spring Boot contract: POST /api/rag-assistant/policies
   */
  async addHospitalPolicy(policyData) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/rag-assistant/policies', policyData);
      return res.data;
    }
    await simulateDelay(500);
    const { addHospitalPolicyDocument } = await import('./mockData');
    return addHospitalPolicyDocument(policyData);
  }
};
