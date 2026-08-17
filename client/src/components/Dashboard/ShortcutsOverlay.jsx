import { useEffect, useState } from "react";
import { FiX, FiCommand } from "react-icons/fi";

const rows = [
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["U"], desc: "Go to Upload" },
  { keys: ["G", "D"], desc: "Go to Dashboard" },
  { keys: ["G", "P"], desc: "Go to Profile" },
  { keys: ["G", "S"], desc: "Go to Settings" },
  { keys: ["/"], desc: "Focus file search" },
  { keys: ["?"], desc: "Show this help" },
  { keys: ["Esc"], desc: "Close modal / palette" },
];

const nav = (t) =>
  window.dispatchEvent(new CustomEvent("sharevault:navigate-tab", { detail: t }));

const ShortcutsOverlay = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let leader = null;
    let timer = null;

    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping()) return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "/") {
        const search = document.querySelector('input[placeholder="Search by file name"]');
        if (search) {
          e.preventDefault();
          search.focus();
        }
        return;
      }
      if (e.key.toLowerCase() === "u") {
        nav("upload");
        return;
      }
      if (e.key.toLowerCase() === "g") {
        leader = "g";
        clearTimeout(timer);
        timer = setTimeout(() => (leader = null), 900);
        return;
      }
      if (leader === "g") {
        const k = e.key.toLowerCase();
        if (k === "d") nav("home");
        else if (k === "p") nav("profile");
        else if (k === "s") nav("settings");
        leader = null;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md glass-strong border border-white/15 rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FiCommand className="text-[var(--primary-text)]" />
            <h3 className="font-bold font-display text-[var(--text-color)]">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[var(--text-color)] hover:text-red-400"
          >
            <FiX />
          </button>
        </div>
        <ul className="divide-y divide-white/5">
          {rows.map((r) => (
            <li key={r.desc} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-[var(--text-color)]">{r.desc}</span>
              <span className="flex gap-1">
                {r.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-[11px] font-mono rounded-md border border-white/10 bg-white/5 text-[var(--primary-text)]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShortcutsOverlay;
