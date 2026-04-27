"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Brain, RefreshCw, MessageSquare, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { postData } from "@/utils/api";

const NODE_BASE_URL = process.env.NEXT_PUBLIC_NODE_BASE_URL || "http://localhost:5000";

// AI_API_URL is now proxied through the backend

const AiConsultantPage = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I am your AI Medical Consultant. How can I help you today? Please describe your symptoms or ask any medical questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const chatEndRef = useRef(null);

  // Load thread ID from localStorage on mount
  useEffect(() => {
    const savedThreadId = localStorage.getItem("medical_ai_thread_id");
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const token = session?.user?.jwt;
      const response = await fetch(`${NODE_BASE_URL}/chatbot/medical_ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessage,
          thread_id: threadId || "default",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      if (data.thread_id && data.thread_id !== threadId) {
        setThreadId(data.thread_id);
        localStorage.setItem("medical_ai_thread_id", data.thread_id);
      }

      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (error) {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([
        {
          role: "ai",
          content: "Hello! I am your AI Medical Consultant. How can I help you today? Please describe your symptoms or ask any medical questions.",
        },
      ]);
      setThreadId(null);
      localStorage.removeItem("medical_ai_thread_id");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-500">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">AI Medical Consultant</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Always Online</p>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          title="Clear Chat"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-5 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-none font-medium leading-relaxed"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase font-black tracking-widest">
                  {msg.role === "user" ? (
                    <>
                      <span>You</span>
                      <User className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3" />
                      <span>AI Consultant</span>
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-gray-400 text-sm font-semibold animate-pulse">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms (e.g., 'I have a headache and fatigue')..."
            className="w-full pl-6 pr-16 py-5 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white placeholder-gray-400 transition-all text-lg shadow-inner shadow-gray-200/50 dark:shadow-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`absolute right-3 p-4 rounded-xl transition-all ${
              !input.trim() || loading
                ? "text-gray-300 bg-gray-50 dark:bg-gray-900"
                : "text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        <p className="mt-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Disclaimer: This AI is for informational purposes only. Consult a real doctor for medical emergencies.
        </p>
      </div>
    </div>
  );
};

export default AiConsultantPage;
