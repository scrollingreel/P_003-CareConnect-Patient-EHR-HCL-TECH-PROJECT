import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, ragAssistantApi } from '../../api';
import { USE_MOCK } from '../../api/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  ShieldCheck,
  Plus,
  BookOpen,
  Database,
  Search,
  Info
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { Modal } from '../../components/common/Modal';

export const AdminAnalytics = () => {
  const queryClient = useQueryClient();
  const [adminTab, setAdminTab] = useState('evaluation'); // 'evaluation' | 'policies'
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policySearch, setPolicySearch] = useState('');
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    category: 'Hospital Administrative SOP',
    section: 'Section 1.0',
    version: '1.0',
    keywords: '',
    snippet: '',
    content: ''
  });

  // The frontend demo records only in-memory telemetry. Refresh the dashboard
  // whenever a new assistant query or auditor feedback is recorded.
  useEffect(() => {
    const refreshTelemetry = () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-query-volume'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-recent-queries'] });
    };
    window.addEventListener('rag:telemetry', refreshTelemetry);
    return () => window.removeEventListener('rag:telemetry', refreshTelemetry);
  }, [queryClient]);

  const { data: policies = [] } = useQuery({
    queryKey: ['hospital-policies'],
    queryFn: () => ragAssistantApi.getHospitalPolicies()
  });

  const addPolicyMutation = useMutation({
    mutationFn: (data) => ragAssistantApi.addHospitalPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-policies'] });
      setPolicyModalOpen(false);
      setNewPolicy({
        title: '',
        category: 'Hospital Administrative SOP',
        section: 'Section 1.0',
        version: '1.0',
        keywords: '',
        snippet: '',
        content: ''
      });
    }
  });

  const { data: kpis } = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: () => analyticsApi.getDashboardKPIs()
  });

  const { data: ragComparison = [] } = useQuery({
    queryKey: ['analytics-rag-comparison'],
    queryFn: () => analyticsApi.getRagComparisonMetrics()
  });

  const { data: queryHistory = [] } = useQuery({
    queryKey: ['analytics-query-volume'],
    queryFn: () => analyticsApi.getQueryVolumeHistory()
  });

  const { data: recentQueries = [], isLoading: isQueriesLoading } = useQuery({
    queryKey: ['analytics-recent-queries'],
    queryFn: () => analyticsApi.getRecentQueries()
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ queryId, feedback }) => analyticsApi.submitFeedback(queryId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-recent-queries'] });
    }
  });

  const handleFeedback = (queryId, currentFeedback, newFeedback) => {
    const feedbackToSend = currentFeedback === newFeedback ? null : newFeedback;
    feedbackMutation.mutate({ queryId, feedback: feedbackToSend });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">
              Clinical AI Knowledge Assistant Analytics
            </h1>
            <Badge variant="purple" size="sm">
              <Award className="w-3.5 h-3.5 mr-1" />
              B.Tech Project Evaluation Model
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Real-time telemetry, grounded retrieval precision metrics, and LLM vs RAG benchmark comparison
          </p>
        </div>

        <Badge variant={USE_MOCK ? 'warning' : 'success'} size="lg">
          {USE_MOCK ? <AlertTriangle className="w-4 h-4 mr-1.5" /> : <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />}
          {USE_MOCK ? 'Demo mode: mock retrieval, no LLM' : 'Live backend telemetry'}
        </Badge>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAdminTab('evaluation')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'evaluation'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>AI Evaluation & RAG Telemetry</span>
        </button>
        <button
          onClick={() => setAdminTab('policies')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'policies'
              ? 'bg-hospital-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Hospital Policies & Knowledge Base Documents ({policies.length})</span>
        </button>
      </div>

      {adminTab === 'evaluation' ? (
        <>
          {USE_MOCK && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700" />
              <div>
                <p className="font-bold">Research safeguard: illustrative data is not a study result.</p>
                <p className="mt-1 leading-relaxed">This frontend currently records only this browser session's demo queries. The comparison chart below is a UI placeholder and must not be cited. Publish results only after a fixed test set, blinded expert ratings, and server-side audit logs are available.</p>
              </div>
            </div>
          )}
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total AI Queries</span>
            <div className="p-2 rounded-xl bg-hospital-50 text-hospital-700">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis?.totalAiQueries?.toLocaleString() ?? '0'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
               <span>{USE_MOCK ? 'Current browser session only' : `${kpis?.queriesGrowthWoW || '—'} vs last week`}</span>
            </p>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Response Time</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis?.averageResponseTimeMs ? `${kpis.averageResponseTimeMs} ms` : '—'}
            </p>
            <p className="text-[11px] text-sky-600 font-semibold mt-0.5">
              Vector retrieval + synthesis
            </p>
          </div>
        </div>

        {/* User Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">User Satisfaction %</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis?.userSatisfactionRate != null ? `${kpis.userSatisfactionRate}%` : '—'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Based on {kpis?.satisfactionResponsesCount ?? 0} recorded ratings
            </p>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Appointments</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis?.totalAppointmentsScheduled?.toLocaleString() ?? '—'}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              {USE_MOCK ? 'Requires real backend data' : 'Active hospital bookings'}
            </p>
          </div>
        </div>
      </div>

      {/* CORE EVALUATION CHART (PAPER RESULT): RAG vs Plain LLM Accuracy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-hospital-600" />
              Core Research Evaluation: RAG Assistant vs. Plain LLM (Zero-Shot Baseline) Accuracy %
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {USE_MOCK
                ? 'Illustrative chart layout — replace with results from your preregistered evaluation dataset'
                : 'Server-reported evaluation results from the configured study dataset'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-hospital-600"></span>
              <span className="text-slate-700">RAG Assistant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300"></span>
              <span className="text-slate-500">Plain LLM Baseline</span>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ragComparison}
              margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="domain"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="%"
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Accuracy']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar
                dataKey="ragAccuracy"
                name="RAG Assistant (Proposed)"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              <Bar
                dataKey="plainLlmAccuracy"
                name="Plain LLM (Zero-Shot)"
                fill="#94a3b8"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-sky-700" />
          <span><strong>Paper requirement:</strong> report the test-set size, document version/date, baseline model and prompt, retrieval configuration, accuracy, citation correctness, retrieval Recall@k, abstention rate, latency, and blinded expert inter-rater agreement. Do not claim statistical significance unless it is calculated from the collected observations.</span>
        </div>
      </div>

      {/* Chart 2: Query Volume & Latency Trend Over Time */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-hospital-600" />
              30-Day AI Query Volume & Response Latency Trends
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily query load and retrieval latency metrics
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={queryHistory}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="queries"
                name="Daily AI Queries"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorQueries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table: Recent AI Queries with Interactive Feedback */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-hospital-600" />
              Recent AI Inquiries & Quality Audit Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inspection of user queries, retrieved document count, response latency, and user feedback
            </p>
          </div>
        </div>

        {isQueriesLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          recentQueries.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">No in-session AI queries yet. Run grounded and out-of-scope test questions to begin collecting demo telemetry.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Inquiry Query</th>
                  <th className="p-3">User Role</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Sources</th>
                  <th className="p-3">Grounded Status</th>
                  <th className="p-3 text-right">Auditor Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-medium text-slate-900 max-w-md">
                      "{q.query}"
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700">{q.userRole}</span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{q.timestamp}</td>
                    <td className="p-3 font-mono font-semibold text-hospital-700">
                      {q.latencyMs} ms
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-800">
                      {q.sourcesRetrieved} Documents
                    </td>
                    <td className="p-3">
                      <Badge variant="success" size="sm">
                        {q.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(q.id, q.feedback, 'positive')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            q.feedback === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Rate Grounded & Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(q.id, q.feedback, 'negative')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            q.feedback === 'negative'
                              ? 'bg-rose-100 text-rose-800'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Report Discrepancy"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        )}
      </div>
        </>
      ) : (
        /* Hospital Policies & Knowledge Base Repository */
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-hospital-600" />
                Hospital Knowledge Base Repository
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {USE_MOCK
                  ? 'Demo corpus for frontend interaction. It is not a vector database and no documents are embedded in this mode.'
                  : <>Authoritative hospital SOPs, visiting policies, doctor schedules, and clinical preparation manuals indexed for evidence-based retrieval.</>}
              </p>
            </div>

            <button
              onClick={() => setPolicyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Upload Policy Document</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
              placeholder="Search indexed hospital policies, SOP IDs, or clinical topics..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Policy Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies
              .filter(
                (p) =>
                  !policySearch ||
                  (p.title && p.title.toLowerCase().includes(policySearch.toLowerCase())) ||
                  (p.snippet && p.snippet.toLowerCase().includes(policySearch.toLowerCase())) ||
                  (p.section && p.section.toLowerCase().includes(policySearch.toLowerCase()))
              )
              .map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-400">{doc.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{doc.title}</h3>
                      </div>
                      <Badge variant="primary" size="sm">
                        {doc.type}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-hospital-700 mb-2">{doc.section}</p>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 font-mono leading-relaxed">
                      "{doc.snippet || (doc.title ? `${doc.title} (v${doc.version || '1.0'})` : 'Authoritative hospital knowledge document')}"
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {USE_MOCK ? 'Demo policy entry' : <>Embedding: <strong className="text-slate-700">server configured</strong></>}
                      </span>
                      <Badge variant={USE_MOCK ? 'warning' : 'success'} size="sm">
                        {USE_MOCK ? 'Not indexed' : 'Vector indexed'}
                      </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Policy Document Modal */}
      {policyModalOpen && (
        <Modal
          isOpen={policyModalOpen}
          onClose={() => setPolicyModalOpen(false)}
          title={USE_MOCK ? 'Add a Demo Knowledge-Base Entry' : 'Add New Hospital Policy / SOP Document'}
          maxWidth="max-w-xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPolicyMutation.mutate(newPolicy);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document / Policy Title</label>
              <input
                type="text"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                placeholder="e.g. ApexCare Inpatient Visitor Policy 2026"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Policy Category</label>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option>Hospital Administrative SOP</option>
                  <option>Departmental SOP & Hours</option>
                  <option>Radiology & Diagnostic Prep</option>
                  <option>Commercial Insurance & Billing Guide</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Section / Clause</label>
                <input
                  type="text"
                  value={newPolicy.section}
                  onChange={(e) => setNewPolicy({ ...newPolicy, section: e.target.value })}
                  placeholder="e.g. Section 4.1: Ward Access"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Retrieval Trigger Keywords (comma-separated)</label>
              <input
                type="text"
                value={newPolicy.keywords}
                onChange={(e) => setNewPolicy({ ...newPolicy, keywords: e.target.value })}
                placeholder="e.g. visitor, ward, hours, access"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Document Text / Official Policy Content</label>
              <textarea
                rows={4}
                value={newPolicy.content}
                onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                placeholder={USE_MOCK ? 'Enter demo policy text for this browser session...' : 'Enter authoritative policy text for server-side indexing...'}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl text-[11px] text-hospital-800">
              {USE_MOCK
                ? 'Demo mode stores this entry in browser memory and uses transparent lexical matching. It is not an embedding or vector-indexing operation.'
                : 'The server will validate, chunk, embed, and index this approved document before it can be retrieved.'}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addPolicyMutation.isPending || !newPolicy.title || !newPolicy.content}
                className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm"
              >
                {addPolicyMutation.isPending ? 'Saving...' : USE_MOCK ? 'Add Demo Entry' : 'Submit for Indexing'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
