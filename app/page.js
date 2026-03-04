"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "## Welcome to **BabarGPT**\n\nAsk anything! I've been optimized for speed and stability. How can I help you today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Throttled scroll to prevent UI lag
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const sendMessage = async () => {
    // 1. DEFENSIVE CHECK: Prevent empty, whitespace-only, or multi-sends
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    // 2. REQUEST LOCK: Immediately set loading to true to disable all inputs
    setLoading(true);
    
    const userMessage = { role: "user", content: trimmedInput };
    const updatedHistory = [...messages, userMessage];
    
    // Optimistically update UI and clear input
    setMessages(updatedHistory);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 3. HISTORY TRUNCATION: Only send the most recent history to save tokens
        body: JSON.stringify({ messages: updatedHistory.slice(-10) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.reply || "Server limit reached.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: `⚠️ **Notice:** ${error.message}. Please wait a moment before trying again.` }
      ]);
    } finally {
      // 4. COOLDOWN: Wait 500ms before unlocking to prevent accidental rapid clicks
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black text-gray-100 font-sans overflow-hidden">

      {/* Header */}
      <header className="flex-none backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto py-4 md:py-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            🤖 <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">BabarGPT</span>
          </h1>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors px-3 py-1 border border-white/10 rounded-full"
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
              <div className={`
                relative px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-xl transition-all
                text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed
                ${msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none ml-12 sm:ml-24" 
                  : "bg-white/10 backdrop-blur-md border border-white/10 rounded-bl-none mr-12 sm:mr-24"}
                w-fit max-w-full
              `}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => <h2 className="text-lg font-bold text-blue-300 my-2">{children}</h2>,
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        li: ({ children }) => <li className="ml-4 list-disc opacity-90">{children}</li>,
                        code: ({ children }) => <code className="bg-black/40 px-1 rounded text-blue-300">{children}</code>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-3 sm:p-6 bg-transparent border-t border-white/5">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            className={`
              w-full pl-4 pr-14 py-3 sm:py-4 bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm sm:text-base 
              placeholder:text-gray-500
              ${loading ? "opacity-50 cursor-not-allowed" : "opacity-100"}
            `}
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "Waiting for AI..." : "Ask BabarGPT anything..."}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 sm:right-2 p-2 sm:p-3 bg-blue-600 hover:bg-blue-500 rounded-lg sm:rounded-xl transition-all active:scale-95 disabled:bg-gray-800 disabled:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </footer>

      <style jsx global>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}