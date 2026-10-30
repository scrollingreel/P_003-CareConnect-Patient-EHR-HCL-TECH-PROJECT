import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          </div>
          <div className="mt-4 flex justify-between items-center pt-2">
            <div className="h-6 bg-slate-200 rounded w-20"></div>
            <div className="h-8 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3 bg-slate-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AiSummarySkeleton = () => {
  return (
    <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-300"></div>
          <div className="h-4 bg-emerald-200 rounded w-48"></div>
        </div>
        <div className="h-4 bg-emerald-100 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-emerald-200/60 rounded w-full"></div>
        <div className="h-3.5 bg-emerald-200/60 rounded w-5/6"></div>
      </div>
      <div className="space-y-2 pt-2 border-t border-emerald-100">
        <div className="h-3 bg-emerald-200/50 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-emerald-100 rounded w-11/12"></div>
        <div className="h-3 bg-emerald-100 rounded w-4/5"></div>
        <div className="h-3 bg-emerald-100 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export const ChatBubbleSkeleton = () => {
  return (
    <div className="flex gap-3 max-w-[85%] animate-pulse mr-auto">
      <div className="w-8 h-8 rounded-lg bg-teal-100 shrink-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-teal-300 rounded-full"></div>
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4 space-y-2.5 w-80">
        <div className="h-3.5 bg-slate-200 rounded w-full"></div>
        <div className="h-3.5 bg-slate-200 rounded w-4/5"></div>
        <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
        <div className="pt-2 border-t border-slate-200 flex gap-2">
          <div className="h-3 bg-slate-300 rounded w-24"></div>
          <div className="h-3 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};
