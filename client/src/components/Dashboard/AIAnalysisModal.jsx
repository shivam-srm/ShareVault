import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiX,
  FiCpu,
  FiShield,
  FiMessageCircle,
  FiFileText,
  FiTag,
  FiAlertTriangle,
  FiSend,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import {
  analyzeDocument,
  getAnalysis,
  askQuestion,
  resetAI,
} from "../../redux/slice/ai/aiSlice";

const RISK_STYLES = {
  LOW: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  MEDIUM: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  HIGH: "text-red-300 border-red-400/30 bg-red-500/10",
};

const SENSITIVE_LABELS = {
  api_key: "API keys",
  email: "Email addresses",
  phone: "Phone numbers",
  password: "Passwords / secrets",
  pii: "Personal information",
  credit_card: "Card numbers",
  other: "Other sensitive data",
};

const TABS = [
  { id: "summary", label: "Summary", icon: FiFileText },
  { id: "security", label: "Security", icon: FiShield },
  { id: "ask", label: "Ask AI", icon: FiMessageCircle },
];

const AIAnalysisModal = ({ isOpen, fileId, fileName, onClose }) => {
  const dispatch = useDispatch();
  const { analysis, loading, analyzing, asking, answer, error } = useSelector(
    (state) => state.ai
  );
  const [tab, setTab] = useState("summary");
  const [question, setQuestion] = useState("");
  const [qa, setQa] = useState([]);

  useEffect(() => {
    if (!isOpen || !fileId) return;
    setTab("summary");
    setQa([]);
    setQuestion("");
    dispatch(resetAI());
    dispatch(getAnalysis(fileId));
  }, [isOpen, fileId, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const completed = analysis?.status === "completed";
  const failed = analysis?.status === "failed";

  const runAnalysis = async () => {
    const res = await dispatch(analyzeDocument(fileId));
    if (res.error) toast.error(res.payload || "Analysis failed.");
    else toast.success("Analysis completed");
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setQuestion("");
    const res = await dispatch(askQuestion({ fileId, question: q }));
    if (res.error) {
      toast.error(res.payload || "Could not answer the question.");
      setQa((prev) => [...prev, { q, a: null, error: res.payload }]);
    } else {
      setQa((prev) => [...prev, { q, a: res.payload?.answer || "" }]);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="glass-strong border border-white/10 rounded-3xl shadow-[var(--shadow-elevated)] w-full max-w-3xl max-h-[92vh] flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] flex items-center justify-center text-white">
              <FiCpu size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--text-color)]">
                AI Document Analysis
              </h2>
              <p className="text-xs text-[var(--text-muted,#94a3b8)] break-all">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-color)] hover:text-red-400 transition p-1"
            aria-label="Close"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={analyzing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <FiRefreshCw className="animate-spin" /> AI is analyzing…
              </>
            ) : completed ? (
              <>
                <FiRefreshCw /> Re-analyze
              </>
            ) : (
              <>
                <FiCpu /> Analyze Document
              </>
            )}
          </button>

          {loading && (
            <span className="text-xs text-[var(--text-muted,#94a3b8)]">Loading analysis…</span>
          )}
          {!loading && completed && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
              <FiCheckCircle /> Analysis completed
            </span>
          )}
          {!loading && failed && (
            <span className="inline-flex items-center gap-1 text-xs text-red-300">
              <FiAlertTriangle /> Analysis failed — you can retry
            </span>
          )}
          {!loading && !analysis && !analyzing && (
            <span className="text-xs text-[var(--text-muted,#94a3b8)]">
              Not analyzed yet
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4 flex gap-2 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border ${
                tab === id
                  ? "text-white bg-white/10 border-white/20"
                  : "text-[var(--text-muted,#94a3b8)] border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && !analyzing && (
            <div className="p-3 rounded-xl border border-red-400/30 bg-red-500/10 text-sm text-red-200">
              {error}
            </div>
          )}

          {tab === "summary" && (
            completed ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-white/15 bg-white/5 text-[var(--primary-text)] capitalize">
                    Type: {analysis.documentType}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      RISK_STYLES[analysis.securityRisk] || RISK_STYLES.LOW
                    }`}
                  >
                    Risk: {analysis.securityRisk}
                  </span>
                </div>

                <div className="glass border border-white/10 rounded-2xl p-4">
                  <h3 className="text-sm font-bold font-display mb-2 text-[var(--text-color)]">
                    AI Summary
                  </h3>
                  <div className="text-sm leading-relaxed text-[var(--text-muted,#94a3b8)] markdown-content">
                    <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                  </div>
                </div>

                {analysis.keywords?.length > 0 && (
                  <div className="glass border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold font-display mb-3 flex items-center gap-2 text-[var(--text-color)]">
                      <FiTag /> Key topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((k) => (
                        <span
                          key={k}
                          className="px-3 py-1 rounded-lg text-xs border border-white/10 bg-white/5 text-[var(--primary-text)]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-sm text-[var(--text-muted,#94a3b8)]">
                {analyzing
                  ? "AI is analyzing this document…"
                  : "Run “Analyze Document” to generate a summary, document type and keywords."}
              </div>
            )
          )}

          {tab === "security" && (
            completed ? (
              <>
                <div
                  className={`rounded-2xl p-4 border ${
                    RISK_STYLES[analysis.securityRisk] || RISK_STYLES.LOW
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold font-display">
                    <FiShield /> Security risk: {analysis.securityRisk}
                  </div>
                  <p className="text-xs mt-1 opacity-80">
                    Heuristic AI scan of the extracted text. This is an assistive signal, not a
                    guarantee — always review sensitive documents yourself.
                  </p>
                </div>

                {analysis.sensitiveData?.length > 0 ? (
                  <div className="glass border border-white/10 rounded-2xl p-4 space-y-2">
                    <h3 className="text-sm font-bold font-display text-[var(--text-color)]">
                      Detected sensitive information
                    </h3>
                    {analysis.sensitiveData.map((s, i) => (
                      <div
                        key={`${s.type}-${i}`}
                        className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-[var(--text-color)]">
                          {SENSITIVE_LABELS[s.type] || s.type}
                        </span>
                        <span className="text-[var(--text-muted,#94a3b8)]">
                          {s.count} occurrence{s.count === 1 ? "" : "s"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass border border-white/10 rounded-2xl p-4 text-sm text-[var(--text-muted,#94a3b8)]">
                    No obvious sensitive information was detected in the extracted text.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-sm text-[var(--text-muted,#94a3b8)]">
                {analyzing ? "AI is analyzing this document…" : "Analyze the document to run a security scan."}
              </div>
            )
          )}

          {tab === "ask" && (
            <div className="space-y-4">
              {!completed && (
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-sm text-[var(--text-muted,#94a3b8)]">
                  Analyze the document first so the AI can answer from its content.
                </div>
              )}

              {qa.map((item, i) => (
                <div key={i} className="space-y-2 animate-fade-in">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-none text-sm bg-[var(--primary-soft)] text-white">
                      {item.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[90%] p-3 rounded-2xl rounded-tl-none text-sm glass border border-white/10 text-[var(--text-color)] markdown-content">
                      {item.a ? (
                        <ReactMarkdown>{item.a}</ReactMarkdown>
                      ) : (
                        <span className="text-red-300">{item.error || "No answer."}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {asking && (
                <div className="flex justify-start">
                  <div className="glass border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <form onSubmit={submitQuestion} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask something about this document…"
                  disabled={!completed || asking}
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--text-color)] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)] transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!completed || asking || !question.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] disabled:opacity-50 transition"
                >
                  <FiSend /> <span className="hidden sm:inline">Ask AI</span>
                </button>
              </form>
              {answer && qa.length === 0 && (
                <div className="markdown-content text-sm">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
