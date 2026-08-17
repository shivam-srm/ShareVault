import React, { useEffect, useState } from "react";
import { FiSun, FiMoon, FiMonitor, FiBell, FiEye, FiSave, FiCheck } from "react-icons/fi";
import useTheme from "../../hooks/useTheme";

const colorMap = {
  pink: "linear-gradient(135deg,#ec4899,#f472b6)",
  blue: "linear-gradient(135deg,#3b82f6,#60a5fa)",
  green: "linear-gradient(135deg,#10b981,#34d399)",
  purple: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
};

const PREFS_KEY = "sharevault:prefs";

const defaultPrefs = {
  notifications: true,
  emailUpdates: false,
  compactView: false,
  autoCopyLink: true,
  defaultExpiry: "7d",
};

const readPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
};

const modeOptions = [
  { id: "light", label: "Light", icon: <FiSun />, desc: "Bright and clean" },
  { id: "dark", label: "Dark", icon: <FiMoon />, desc: "Easy on the eyes" },
  { id: "system", label: "System", icon: <FiMonitor />, desc: "Match your OS" },
];

const expiryOptions = [
  { id: "1d", label: "1 day" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "never", label: "Never" },
];

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      checked ? "bg-[var(--gradient-aurora)]" : "bg-white/10"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const Settings = () => {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [prefs, setPrefs] = useState(readPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const update = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Appearance */}
      <section className="glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-3 mb-1">
          <FiEye className="text-[var(--primary-text)] text-xl" />
          <h3 className="text-xl font-bold font-display text-[var(--text-color)]">
            Appearance
          </h3>
        </div>
        <p className="text-sm text-[var(--text-muted,#94a3b8)] mb-6">
          Choose how ShareVault looks on this device.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Segmented mode pill — matches header */}
          <div
            className="glass rounded-full p-1 flex items-center gap-1"
            role="group"
            aria-label="Color mode"
          >
            {modeOptions.map((opt) => {
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  aria-label={opt.label}
                  aria-pressed={active}
                  title={opt.label}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    active
                      ? "bg-[var(--gradient-aurora)] text-white shadow-[var(--shadow-glow)]"
                      : "text-[var(--text-dim,#94a3b8)] hover:text-[var(--text-color)]"
                  }`}
                >
                  <span className="text-sm">{opt.icon}</span>
                </button>
              );
            })}
          </div>

          {/* Accent swatches — matches header */}
          <div className="glass rounded-full p-1.5 flex items-center gap-2">
            {Object.keys(colorMap).map((c) => (
              <button
                key={c}
                onClick={() => setTheme(c)}
                aria-label={`${c} accent`}
                className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                  theme === c
                    ? "ring-2 ring-offset-2 ring-offset-[var(--bg-color)] ring-white"
                    : ""
                }`}
                style={{ background: colorMap[c] }}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Notifications */}
      <section className="glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-3 mb-6">
          <FiBell className="text-[var(--primary-text)] text-xl" />
          <h3 className="text-xl font-bold font-display text-[var(--text-color)]">
            Notifications
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { key: "notifications", label: "In-app notifications", desc: "Toasts for uploads, shares, and errors" },
            { key: "emailUpdates", label: "Email updates", desc: "Occasional product news and tips" },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 py-2">
              <div>
                <div className="font-medium text-[var(--text-color)]">{row.label}</div>
                <div className="text-xs text-[var(--text-muted,#94a3b8)]">{row.desc}</div>
              </div>
              <Toggle checked={!!prefs[row.key]} onChange={(v) => update(row.key, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
        <h3 className="text-xl font-bold font-display text-[var(--text-color)] mb-6">
          Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <div className="font-medium text-[var(--text-color)]">Compact file list</div>
              <div className="text-xs text-[var(--text-muted,#94a3b8)]">Denser rows in the dashboard</div>
            </div>
            <Toggle checked={prefs.compactView} onChange={(v) => update("compactView", v)} />
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <div className="font-medium text-[var(--text-color)]">Auto-copy share link</div>
              <div className="text-xs text-[var(--text-muted,#94a3b8)]">Copy the link right after upload</div>
            </div>
            <Toggle checked={prefs.autoCopyLink} onChange={(v) => update("autoCopyLink", v)} />
          </div>

          <div className="py-2">
            <div className="font-medium text-[var(--text-color)] mb-2">Default expiry</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {expiryOptions.map((opt) => {
                const active = prefs.defaultExpiry === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => update("defaultExpiry", opt.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
                      active
                        ? "border-transparent bg-[var(--gradient-aurora)] text-white shadow-[var(--shadow-glow)]"
                        : "border-white/10 bg-white/5 text-[var(--text-color)] hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
          >
            {saved ? <FiCheck /> : <FiSave />}
            {saved ? "Saved" : "Save preferences"}
          </button>
          <span className="text-xs text-[var(--text-muted,#94a3b8)]">
            Saved locally on this device.
          </span>
        </div>
      </section>
    </div>
  );
};

export default Settings;
