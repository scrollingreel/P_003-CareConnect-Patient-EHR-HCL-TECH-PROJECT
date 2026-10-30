import React, { createContext, useContext, useState } from 'react';
import { ragAssistantApi } from '../api';

const AssistantContext = createContext(null);

export const AssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hello! I am the ApexCare Hospital Knowledge Assistant. I can look up approved hospital documents for department visiting hours, OPD schedules, diagnostic preparations, and insurance or hospital policies. I will say when the knowledge base does not support an answer.\n\nHow may I assist you today?",
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);

  const sendMessage = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ragAssistantApi.query({ query: queryText });

      const aiMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: response.model,
        retrievalStatus: response.retrievalStatus,
        retrievalScore: response.retrievalScore,
        mode: response.mode
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered an error retrieving grounded documents from the knowledge store. Please verify your connection or consult the hospital desk.",
        isError: true,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'ai',
        text: "Chat session refreshed. What clinical or hospital inquiry can I look up for you in the knowledge base?",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const value = {
    isOpen,
    toggleOpen,
    openAssistant,
    closeAssistant,
    messages,
    isLoading,
    sendMessage,
    clearChat,
    selectedSource,
    setSelectedSource
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
