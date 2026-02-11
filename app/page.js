"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "## Welcome to **BabarGPT**\n\nAsk anything and get clear, well-formatted answers instantly. Fast, intuitive, and always ready to help!."
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

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black text-gray-100 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            🤖 <span className="text-blue-500 drop-shadow-lg">BabarGPT</span>
          </h1>
          <span className="text-sm text-gray-400 tracking-wide">
            Modern AI Experience
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`max-w-3xl px-8 py-6 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-[1.01] whitespace-pre-wrap leading-8 text-[17px] ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 rounded-bl-none"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-5 mb-3 text-blue-400">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-4 mb-2 text-blue-300">
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-gray-200 leading-8 text-[17px]">
                          {children}
                        </p>
                      ),
                      li: ({ children }) => (
                        <li className="ml-6 list-disc mb-2 text-gray-300 text-[16px]">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-8 py-5 rounded-3xl border border-white/10 flex items-center gap-3 shadow-xl">
                <span className="text-gray-300 text-lg font-medium">
                  Thinking
                </span>
                <div className="flex gap-2">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-5xl mx-auto px-8 py-6 flex gap-4 items-center">

          <input
            className="flex-1 px-6 py-4 text-lg rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-200 placeholder-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="px-7 py-4 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold shadow-2xl flex items-center gap-2"
          >
            Send
          </button>

        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
