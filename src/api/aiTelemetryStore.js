// Browser-memory telemetry used only when VITE_USE_MOCK is enabled.
// It avoids persisting potentially sensitive queries in localStorage. In the
// production system these events must be stored server-side with consent,
// access controls, retention limits, and de-identification.
let queryEvents = [];

const createId = () => `Q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const recordAiQuery = ({ query, latencyMs, sourceCount, status, retrievalScore }) => {
  const event = {
    id: createId(),
    query,
    userRole: 'Demo user',
    timestamp: new Date().toLocaleString(),
    latencyMs: Math.round(latencyMs),
    sourcesRetrieved: sourceCount,
    status: status === 'GROUNDED' ? 'Grounded response' : 'Safely abstained',
    retrievalScore,
    feedback: null
  };
  queryEvents = [event, ...queryEvents].slice(0, 100);
  window.dispatchEvent(new CustomEvent('rag:telemetry'));
  return event;
};

export const getAiQueryEvents = () => queryEvents;

export const setAiQueryFeedback = (queryId, feedback) => {
  queryEvents = queryEvents.map((event) =>
    event.id === queryId ? { ...event, feedback } : event
  );
  window.dispatchEvent(new CustomEvent('rag:telemetry'));
};

export const getDemoKpis = () => {
  const feedbackEvents = queryEvents.filter((event) => event.feedback);
  const positiveFeedback = feedbackEvents.filter((event) => event.feedback === 'positive').length;
  const totalLatency = queryEvents.reduce((total, event) => total + event.latencyMs, 0);
  const grounded = queryEvents.filter((event) => event.status === 'Grounded response').length;

  return {
    totalAiQueries: queryEvents.length,
    averageResponseTimeMs: queryEvents.length ? Math.round(totalLatency / queryEvents.length) : null,
    userSatisfactionRate: feedbackEvents.length
      ? Number(((positiveFeedback / feedbackEvents.length) * 100).toFixed(1))
      : null,
    satisfactionResponsesCount: feedbackEvents.length,
    groundedResponseRate: queryEvents.length
      ? Number(((grounded / queryEvents.length) * 100).toFixed(1))
      : null,
    totalAppointmentsScheduled: null
  };
};

export const getDemoQueryHistory = () => {
  const day = new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  const kpis = getDemoKpis();
  return queryEvents.length
    ? [{ date: day, queries: queryEvents.length, avgLatencyMs: kpis.averageResponseTimeMs }]
    : [];
};
