import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import useTheme from "../hooks/useTheme";

const colorMap = {
  pink: "linear-gradient(135deg,#ec4899,#f472b6)",
  blue: "linear-gradient(135deg,#3b82f6,#60a5fa)",
  green: "linear-gradient(135deg,#10b981,#34d399)",
  purple: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, mode, setTheme, setMode } = useTheme();

  const ModeIcon = ({ m }) => {
    if (m === "system") return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4" strokeLinecap="round"/></svg>
    );
    if (m === "light") return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" strokeLinecap="round"/></svg>
    );
    return (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
    );
  };

  const ModeSegmented = () => (
    <div className="glass rounded-full p-1 flex items-center gap-1" role="group" aria-label="Color mode">
      {["light", "dark", "system"].map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          aria-label={m}
          aria-pressed={mode === m}
          title={m === "system" ? "Use system theme" : m}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            mode === m
              ? "bg-[var(--gradient-aurora)] text-white shadow-[var(--shadow-glow)]"
              : "text-[var(--text-dim)] hover:text-[var(--text-color)]"
          }`}
        >
          <ModeIcon m={m} />
        </button>
      ))}
    </div>
  );
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  const isActive = (p) => pathname === p;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`glass-strong rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-500 ${
              scrolled ? "shadow-2xl" : ""
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <Logo size={40} className="transition-transform group-hover:scale-110" />
              <div className="hidden sm:block">
                <span className="text-xl md:text-2xl font-display font-bold gradient-text">ShareVault</span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] -mt-1">Share instantly</p>
              </div>
            </Link>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Mode segmented (Light / Dark / System) */}
              <ModeSegmented />

              {/* Theme picker */}
              <div className="relative">
                <button
                  onClick={() => setThemeOpen(!themeOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ background: colorMap[theme] }}
                  aria-label="Theme"
                />
                {themeOpen && (
                  <div className="absolute right-0 mt-3 glass-strong rounded-2xl p-4 min-w-[180px] animate-scale-in">
                    <p className="text-xs uppercase tracking-widest text-[var(--text-dim)] mb-3">Accent</p>
                    <div className="flex gap-2">
                      {Object.keys(colorMap).map((c) => (
                        <button
                          key={c}
                          onClick={() => { setTheme(c); setThemeOpen(false); }}
                          className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${theme === c ? "ring-2 ring-offset-2 ring-offset-[var(--bg-color)] ring-white" : ""}`}
                          style={{ background: colorMap[c] }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/login"
                className={`btn-ghost text-sm ${isActive("/login") ? "text-[var(--primary-text)]" : ""}`}
              >
                Log in
              </Link>
              <Link to="/signup" className="btn-premium text-sm">Get Started</Link>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-80 glass-strong p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-display font-bold gradient-text">ShareVault</span>
              <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full glass flex items-center justify-center text-lg">×</button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl glass mb-4">
              <span className="text-sm">Appearance</span>
              <ModeSegmented />
            </div>

            <div className="p-4 rounded-xl glass mb-6">
              <p className="text-xs uppercase tracking-widest text-[var(--text-dim)] mb-3">Accent</p>
              <div className="flex gap-2">
                {Object.keys(colorMap).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTheme(c)}
                    className={`w-8 h-8 rounded-full ${theme === c ? "ring-2 ring-white" : ""}`}
                    style={{ background: colorMap[c] }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost text-center">Log in</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-premium text-center">Get Started</Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
