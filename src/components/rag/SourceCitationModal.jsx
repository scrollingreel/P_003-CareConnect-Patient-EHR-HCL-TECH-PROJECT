import React from 'react';
import { Modal } from '../common/Modal';
import { FileText, ShieldCheck, Bookmark, ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';
import { USE_MOCK } from '../../api/client';

export const SourceCitationModal = ({ source, isOpen, onClose }) => {
  if (!source) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hospital Knowledge Citation" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Document Header */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-100 text-hospital-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{source.documentName}</h4>
                <p className="text-xs text-slate-500">{source.documentType || 'Clinical Reference Document'}</p>
              </div>
            </div>
            <Badge variant="success" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {Math.round((source.similarityScore || 0) * 100)}% Retrieval Score
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Section:</span> {source.section || 'General Protocol'}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Document ID:</span> {source.id || 'DOC-VERIFIED'}
            </div>
          </div>
        </div>

        {/* Retrieved Snippet */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-hospital-600" />
            {USE_MOCK ? 'Retrieved Demo Corpus Snippet' : 'Exact Retrieved Document Chunk'}
          </label>
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs leading-relaxed text-slate-800 font-mono">
            "{source.snippet}"
          </div>
        </div>

        {/* Retrieval verification note */}
        <div className="text-[11px] text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-0.5">Verification Integrity:</p>
          {USE_MOCK
            ? 'Frontend demo mode: this citation was selected by transparent lexical matching. No vector database, embedding model, or LLM was invoked.'
            : 'This citation was returned by the server-side retrieval pipeline. Verify the document revision and full source before relying on it.'}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Close Citation
          </button>
        </div>
      </div>
    </Modal>
  );
};
