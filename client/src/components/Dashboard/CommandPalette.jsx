import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHome, FiUpload, FiUser, FiSettings, FiLogOut, FiFile, FiCopy, FiSun, FiMoon } from "react-icons/fi";
import { toast } from "react-toastify";

const navigateTab = (tab) =>
  window.dispatchEvent(new CustomEvent("sharevault:navigate-tab", { detail: tab }));

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { files } = useSelector((s) => s.file);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener("sharevault:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sharevault:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sv-theme-mode", next);
    window.dispatchEvent(new CustomEvent("sharevault:theme-change", { detail: next }));
    toast.success(`Switched to ${next} mode`);
  };

  const actions = useMemo(
    () => [
      { id: "home", label: "Go to Dashboard", icon: <FiHome />, run: () => navigateTab("home") },
      { id: "upload", label: "Upload files", icon: <FiUpload />, run: () => navigateTab("upload") },
      { id: "profile", label: "Open profile", icon: <FiUser />, run: () => navigateTab("profile") },
      { id: "settings", label: "Open settings", icon: <FiSettings />, run: () => navigateTab("settings") },
      { id: "theme", label: "Toggle light/dark theme", icon: <FiSun />, run: toggleTheme },
      {
        id: "copylast",
        label: "Copy last uploaded file link",
        icon: <FiCopy />,
        run: () => {
          const latest = [...(files || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          if (!latest?.shortUrl) return toast.warn("No shareable link yet");
          navigator.clipboard.writeText(`${window.location.origin}${latest.shortUrl}`);
          toast.success("Latest link copied");
        },
      },
      { id: "logout", label: "Sign out", icon: <FiLogOut />, run: () => navigateTab("logout") },
    ],
    [files]
  );

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const fileMatches = (files || [])
      .filter((f) => (query ? f.name.toLowerCase().includes(query) : false))
      .slice(0, 6)
      .map((f) => ({
        id: `file-${f._id}`,
        label: f.name,
        sub: f.type,
        icon: <FiFile />,
        run: () => {
          if (f.shortUrl) {
            navigator.clipboard.writeText(`${window.location.origin}${f.shortUrl}`);
            toast.success("Link copied");
          } else {
            navigateTab("home");
          }
        },
      }));
    const actionMatches = actions.filter((a) =>
      query ? a.label.toLowerCase().includes(query) : true
    );
    return [...fileMatches, ...actionMatches];
  }, [q, files, actions]);

  const run = (item) => {
    item.run();
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[idx]) run(results[idx]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl glass-strong border border-white/15 rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <FiSearch className="text-[var(--primary-text)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={onKey}
            placeholder="Search files or run a command…"
            className="flex-1 bg-transparent outline-none text-[var(--text-color)] placeholder-white/40"
          />
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted,#94a3b8)] px-2 py-1 rounded border border-white/10">
            Esc
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted,#94a3b8)]">
              No matches
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => run(r)}
              onMouseEnter={() => setIdx(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                i === idx ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span className="text-[var(--primary-text)]">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-[var(--text-color)] truncate">{r.label}</span>
                {r.sub && (
                  <span className="block text-[11px] text-[var(--text-muted,#94a3b8)] truncate">
                    {r.sub}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-white/10 text-[11px] text-[var(--text-muted,#94a3b8)] flex justify-between">
          <span>↑↓ navigate · Enter to run</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
