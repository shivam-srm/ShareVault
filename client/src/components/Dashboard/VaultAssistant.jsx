import React, { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiSend, FiX, FiMinus, FiMaximize2, FiCpu, FiPaperclip, FiFileText, FiImage } from "react-icons/fi";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";

const VaultAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { role: "assistant", content: "Hello! I'm your Vault Assistant. How can I help you with your files today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const isImage = (file) => file && file.type.startsWith("image/");

  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Attachment must be under 8 MB");
      return;
    }
    setAttachment(file);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const sendWithAttachment = async (file, text) => {
    const label = `${isImage(file) ? "🖼️" : "📄"} **${file.name}**${text ? `\n\n${text}` : ""}`;
    setChat(prev => [...prev, { role: "user", content: label }]);
    setMessage("");
    setAttachment(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("message", text || "");
      form.append("history", JSON.stringify(chat.slice(-6)));
      const res = await axiosInstance.post("/ai/chat-attachment", form);
      setChat(prev => [...prev, { role: "assistant", content: res.data.message }]);
    } catch (err) {
      const msg = err?.response?.data?.error || "Could not analyze that attachment.";
      toast.error(msg);
      setChat(prev => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (attachment) return sendWithAttachment(attachment, message.trim());
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message };
    setChat(prev => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const history = chat.slice(-6); // Last 6 messages for context
      const res = await axiosInstance.post("/ai/chat", { message, history });
      const aiContent = res.data.message;
      
      // Handle special actions
      if (aiContent.includes("ACTION:DELETE:")) {
        const fileId = aiContent.split("ACTION:DELETE:")[1].split(" ")[0].trim();
        try {
          await axiosInstance.delete(`/files/deleteFile/${fileId}`);
          toast.success("File deleted by Assistant");
          window.dispatchEvent(new CustomEvent('sharevault:refresh-files'));
        } catch (e) {
          toast.error("Assistant failed to delete the file");
        }
      }

      setChat(prev => [...prev, { role: "assistant", content: aiContent.replace(/ACTION:[A-Z]+:[a-zA-Z0-9]+/g, "").trim() }]);
    } catch (err) {
      console.error(err);
      toast.error("Assistant connection error. Please try again later.");
      setChat(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please check back in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform animate-float"
        title="Open Vault Assistant"
      >
        <FiCpu />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[60] glass-strong border border-white/10 rounded-3xl shadow-[var(--shadow-elevated)] transition-all duration-300 overflow-hidden flex flex-col ${
        isMinimized ? 'w-64 h-14' : 'w-full max-w-[400px] h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--gradient-aurora)] flex items-center justify-center text-white">
            <FiCpu />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display">Vault Assistant</h3>
            {!isMinimized && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Online</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white p-1">
            {isMinimized ? <FiMaximize2 size={16} /> : <FiMinus size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-red-400 p-1">
            <FiX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
          >
            {chat.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[var(--primary-soft)] text-white rounded-tr-none' 
                      : 'glass border border-white/10 text-[var(--text-color)] rounded-tl-none'
                  }`}
                >
                  <div className="markdown-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 space-y-2">
            {attachment && (
              <div className="flex items-center gap-2 glass border border-white/10 rounded-xl px-3 py-2 text-xs">
                {isImage(attachment) ? <FiImage className="shrink-0" /> : <FiFileText className="shrink-0" />}
                <span className="truncate flex-1">{attachment.name}</span>
                <span className="text-[var(--text-muted)]">{(attachment.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-400 p-1" title="Remove attachment">
                  <FiX size={14} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handlePickFile}
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.docx,.txt,.md,.json,.csv,.log,.yml,.yaml,.xml,.js,.jsx,.ts,.tsx,.py,.sql,.html,.css"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Attach a screenshot or document"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--primary-text)] text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-50"
              >
                <FiPaperclip />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={attachment ? "Ask about this file..." : "Ask anything..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary-text)] transition-colors"
              />
              <button
                type="submit"
                disabled={loading || (!message.trim() && !attachment)}
                className="btn-premium p-2 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <FiSend />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default VaultAssistant;
