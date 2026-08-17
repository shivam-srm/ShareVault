import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiMinus, FiMaximize2, FiCpu } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import axiosInstance from "../../config/axiosInstance";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm the **Vault Assistant**. Ask me anything about ShareVault — secure sharing, link expiry, or AI document analysis.",
};

const SUGGESTIONS = [
  "What is ShareVault?",
  "How does AI document analysis work?",
  "Is sharing secure?",
];

const PublicAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([GREETING]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, loading]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const send = async (text) => {
    const value = (text ?? message).trim();
    if (!value || loading) return;

    const history = chat.filter((m) => m !== GREETING).slice(-6);
    setChat((prev) => [...prev, { role: "user", content: value }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/ai/public-chat", { message: value, history });
      setChat((prev) => [...prev, { role: "assistant", content: res.data.message }]);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "I'm having trouble connecting right now. Please try again in a moment.";
      setChat((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
        title="Ask the Vault Assistant"
        aria-label="Open Vault Assistant chat"
      >
        <FiCpu />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] glass-strong border border-white/10 rounded-3xl shadow-[var(--shadow-elevated)] transition-all duration-300 overflow-hidden flex flex-col ${
        isMinimized ? "w-64 h-14" : "w-[calc(100vw-3rem)] max-w-[380px] h-[500px]"
      }`}
    >
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--gradient-aurora)] flex items-center justify-center text-white">
            <FiCpu />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display">Vault Assistant</h3>
            {!isMinimized && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white p-1" aria-label="Minimise chat">
            {isMinimized ? <FiMaximize2 size={16} /> : <FiMinus size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-red-400 p-1" aria-label="Close chat">
            <FiX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-[var(--primary-soft)] text-white rounded-tr-none"
                      : "glass border border-white/10 text-[var(--text-color)] rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown className="markdown-content">{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="glass border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {chat.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-muted)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about ShareVault..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary-text)] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-premium p-2 rounded-xl flex items-center justify-center disabled:opacity-50"
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default PublicAssistant;
