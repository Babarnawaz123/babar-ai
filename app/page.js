"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "## Welcome to **BabarGPT**\n\nAsk anything and get clear, well-formatted answers instantly. Fast, intuitive, and always ready to help!."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Something went wrong." }]);
    }
    setLoading(false);
  };

  return (
    // Fixed height for mobile to prevent address bar jumping
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black text-gray-100 font-sans overflow-hidden">

      {/* Header - Fluid height & padding */}
      <header className="flex-none backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto py-4 md:py-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            🤖 <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">BabarGPT</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">v2.0 Live</span>
          </div>
        </div>
      </header>

      {/* Chat Area - Uses 100% width on mobile, 80% on tablet, 60% on desktop */}
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
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
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => <h2 className="text-lg font-bold text-blue-300 my-2">{children}</h2>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      li: ({ children }) => <li className="ml-4 list-disc opacity-90">{children}</li>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area - Floating style on mobile, docked on desktop */}
      <footer className="p-3 sm:p-6 bg-transparent border-t border-white/5">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            className="w-full pl-4 pr-14 py-3 sm:py-4 bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm sm:text-base placeholder:text-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BabarGPT anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-1.5 sm:right-2 p-2 sm:p-3 bg-blue-600 hover:bg-blue-500 rounded-lg sm:rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Safety padding for iPhones with Home Indicator */}
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </footer>

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}