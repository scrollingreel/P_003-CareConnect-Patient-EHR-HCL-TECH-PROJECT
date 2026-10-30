import React, { useState, useRef, useEffect } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import { SUGGESTED_PROMPTS } from '../../api';
import { SourceCitationModal } from './SourceCitationModal';
import { ChatBubbleSkeleton } from '../common/SkeletonLoader';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const RagAssistantDrawer = () => {
  const {
    isOpen,
    closeAssistant,
    messages,
    isLoading,
    sendMessage,
    clearChat,
    selectedSource,
    setSelectedSource
  } = useAssistant();

  const [inputQuery, setInputQuery] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const query = inputQuery;
    setInputQuery('');
    sendMessage(query);
  };

  const handlePromptClick = (promptQuery) => {
    setInputQuery('');
    sendMessage(promptQuery);
  };

  const toggleSourceCollapse = (msgId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        onClick={closeAssistant}
      />

      {/* Floating Chat Drawer */}
      <aside
        className={`fixed bottom-0 right-0 z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300 ${
          isExpandedFull
            ? 'w-full md:w-[700px] h-[92vh] rounded-tl-2xl'
            : 'w-full sm:w-[460px] h-[85vh] sm:h-[680px] sm:rounded-tl-2xl sm:border-t sm:border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-hospital-900 to-slate-900 text-white flex items-center justify-between sm:rounded-tl-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hospital-500/20 border border-hospital-400/30 flex items-center justify-center text-hospital-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                ApexCare AI Assistant
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-hospital-500 text-slate-950 font-bold rounded">
                  RAG
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Grounded in Hospital Knowledge Base</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpandedFull(!isExpandedFull)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isExpandedFull ? 'Minimize' : 'Expand window'}
            >
              {isExpandedFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeAssistant}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggested Queries Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-hospital-600" />
              Suggested:
            </span>
            {SUGGESTED_PROMPTS.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(item.query)}
                className="text-[11px] font-medium bg-white hover:bg-hospital-50 text-slate-700 hover:text-hospital-700 px-2.5 py-1 rounded-full border border-slate-200 shadow-xs transition-colors shrink-0"
              >
                {item.category}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const hasSources = msg.sources && msg.sources.length > 0;
            const isSourcesExpanded = !!expandedSources[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-hospital-700 to-hospital-500 text-white shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-hospital-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-line break-words space-y-2">
                    {msg.text}
                  </div>

                  {!isUser && msg.retrievalStatus && (
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold ${
                        msg.retrievalStatus === 'GROUNDED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {msg.retrievalStatus === 'GROUNDED' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                      {msg.retrievalStatus === 'GROUNDED'
                        ? `Grounded in retrieved documents${msg.retrievalScore ? ` · demo retrieval score ${Math.round(msg.retrievalScore * 100)}%` : ''}`
                        : 'No sufficiently relevant source found — safely abstained'}
                    </div>
                  )}

                  {/* RAG Retrieved Sources Section (Grounding Proof) */}
                  {hasSources && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => toggleSourceCollapse(msg.id)}
                        className="w-full flex items-center justify-between text-hospital-700 hover:text-hospital-800 font-semibold text-[11px] py-1 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Retrieved Sources ({msg.sources.length} document snippets)
                        </span>
                        {isSourcesExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isSourcesExpanded && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              onClick={() => setSelectedSource(src)}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-hospital-400 hover:bg-hospital-50/50 cursor-pointer transition-all group"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1 group-hover:text-hospital-700">
                                  <FileText className="w-3 h-3 text-hospital-600" />
                                  {src.documentName}
                                </span>
                                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                  {Math.round((src.similarityScore || 0) * 100)}% Demo retrieval score
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 italic font-mono bg-white p-1.5 rounded border border-slate-100">
                                "{src.snippet}"
                              </p>
                              <span className="block mt-1 text-[9px] text-hospital-600 font-semibold group-hover:underline">
                                Click to inspect full document citation →
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-2 text-[9px] text-right ${
                      isUser ? 'text-hospital-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && <ChatBubbleSkeleton />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Mandatory Medical Disclaimer */}
        <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
          {/* Permanent Disclaimer Requirement */}
          <div className="mb-2 px-2 py-1.5 bg-amber-50/90 border border-amber-200 rounded-lg flex items-center gap-2 text-[10px] text-amber-800 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Notice:</strong> This assistant provides informational support only and is not a substitute for professional medical advice.
            </span>
          </div>

          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about hospital policies, doctor hours, insurance, prep..."
              disabled={isLoading}
              className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="absolute right-1.5 p-2 bg-hospital-600 hover:bg-hospital-700 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-xs"
              title="Submit query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </aside>

      {/* Full Source Citation Detail Modal */}
      <SourceCitationModal
        source={selectedSource}
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(null)}
      />
    </>
  );
};
