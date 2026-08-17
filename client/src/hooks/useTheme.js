import { useEffect, useState, useCallback } from "react";

const THEME_EVENT = "sharevault:theme-change";
const VALID_MODES = ["dark", "light", "system"];

const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const readInitial = () => {
  if (typeof window === "undefined") return { theme: "purple", mode: "dark" };
  const storedMode = localStorage.getItem("mode");
  return {
    theme: localStorage.getItem("theme") || "purple",
    mode: VALID_MODES.includes(storedMode) ? storedMode : "dark",
  };
};

const resolveMode = (mode) => (mode === "system" ? getSystemMode() : mode);

export const applyTheme = (theme, mode) => {
  if (typeof document === "undefined") return;
  document.body.setAttribute("data-theme", theme);
  document.body.setAttribute("data-mode", resolveMode(mode));
};

export default function useTheme() {
  const [{ theme, mode }, setState] = useState(readInitial);

  useEffect(() => {
    applyTheme(theme, mode);
  }, [theme, mode]);

  // Re-apply when OS preference changes while in "system" mode
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme, "system");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode, theme]);

  useEffect(() => {
    const sync = () => setState(readInitial());
    const onCustom = (e) => {
      if (e?.detail) setState({ theme: e.detail.theme, mode: e.detail.mode });
      else sync();
    };
    window.addEventListener(THEME_EVENT, onCustom);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, onCustom);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    localStorage.setItem("theme", newTheme);
    setState((s) => {
      const next = { ...s, theme: newTheme };
      applyTheme(next.theme, next.mode);
      window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
      return next;
    });
  }, []);

  const setMode = useCallback((newMode) => {
    const safe = VALID_MODES.includes(newMode) ? newMode : "dark";
    localStorage.setItem("mode", safe);
    setState((s) => {
      const next = { ...s, mode: safe };
      applyTheme(next.theme, next.mode);
      window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
      return next;
    });
  }, []);

  const resolvedMode = resolveMode(mode);

  const toggleMode = useCallback(() => {
    // Cycle: dark → light → system → dark
    setMode(mode === "dark" ? "light" : mode === "light" ? "system" : "dark");
  }, [mode, setMode]);

  return { theme, mode, resolvedMode, setTheme, setMode, toggleMode };
}
