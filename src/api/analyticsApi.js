import { apiClient, USE_MOCK, simulateDelay } from './client';
import { MOCK_ANALYTICS_DATA } from './mockData';
import {
  getAiQueryEvents,
  getDemoKpis,
  getDemoQueryHistory,
  setAiQueryFeedback
} from './aiTelemetryStore';

export const analyticsApi = {
  /**
   * Fetch core hospital & AI performance KPIs
   * Spring Boot contract: GET /api/analytics/kpis
   */
  async getDashboardKPIs() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/analytics/kpis');
      return res.data;
    }
    await simulateDelay(300);
    return getDemoKpis();
  },

  /**
   * Fetch RAG vs Plain LLM evaluation benchmarks (for B.Tech Major Project Paper)
   * Spring Boot contract: GET /api/analytics/rag-comparison
   */
  async getRagComparisonMetrics() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/analytics/rag-comparison');
      return res.data;
    }
    await simulateDelay(350);
    return MOCK_ANALYTICS_DATA.ragVsPlainComparison;
  },

  /**
   * Fetch query volume and latency trends over time
   * Spring Boot contract: GET /api/analytics/query-volume
   */
  async getQueryVolumeHistory() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/analytics/query-volume');
      return res.data;
    }
    await simulateDelay(350);
    return getDemoQueryHistory();
  },

  /**
   * Fetch recent queries log with latency, sources count and feedback status
   * Spring Boot contract: GET /api/analytics/recent-queries
   */
  async getRecentQueries() {
    if (!USE_MOCK) {
      const res = await apiClient.get('/analytics/recent-queries');
      return res.data;
    }
    await simulateDelay(300);
    return getAiQueryEvents();
  },

  /**
   * Submit or toggle feedback (thumbs up / thumbs down) for an AI query
   * Spring Boot contract: POST /api/analytics/feedback
   */
  async submitFeedback(queryId, feedback) {
    if (!USE_MOCK) {
      const res = await apiClient.post('/analytics/feedback', { queryId, feedback });
      return res.data;
    }
    await simulateDelay(250);
    setAiQueryFeedback(queryId, feedback);
    return { success: true, queryId, feedback };
  }
};
