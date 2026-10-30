import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RagAssistantDrawer } from '../rag/RagAssistantDrawer';
import { useAssistant } from '../../context/AssistantContext';
import { Sparkles, MessageSquareHeart } from 'lucide-react';

export const AppLayout = () => {
  const { isOpen, openAssistant } = useAssistant();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating RAG Assistant Action Button */}
      {!isOpen && (
        <button
          onClick={openAssistant}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-hospital-700 to-hospital-600 hover:from-hospital-800 hover:to-hospital-700 text-white rounded-full shadow-lg shadow-hospital-600/30 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-hospital-500/20 group no-print"
          title="Open AI Healthcare Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-hospital-200 group-hover:rotate-12 transition-transform" />
            <span className="animate-ping absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-hospital-300 opacity-75"></span>
            <span className="relative inline-flex -top-1 -right-1 rounded-full h-2 w-2 bg-white"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">RAG Healthcare AI</span>
        </button>
      )}

      {/* RAG Knowledge Assistant Drawer */}
      <RagAssistantDrawer />
    </div>
  );
};
