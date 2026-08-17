import { useEffect, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

const GlobalDropzone = () => {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let counter = 0;
    const onEnter = (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      counter += 1;
      setDragging(true);
    };
    const onLeave = () => {
      counter = Math.max(0, counter - 1);
      if (counter === 0) setDragging(false);
    };
    const onOver = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
    };
    const onDrop = (e) => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      counter = 0;
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      // Switch to upload tab
      window.dispatchEvent(new CustomEvent("sharevault:navigate-tab", { detail: "upload" }));
      // Hand off files to UploadPage
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sharevault:external-drop", { detail: files }));
      }, 60);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!dragging) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center p-8 animate-fade-in">
      <div className="absolute inset-4 rounded-3xl border-4 border-dashed border-indigo-400/70 bg-[var(--gradient-aurora)] opacity-30" />
      <div className="relative glass-strong border border-white/20 rounded-3xl px-10 py-12 text-center shadow-[var(--shadow-elevated)]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--gradient-aurora)] flex items-center justify-center shadow-[var(--shadow-glow)] animate-float">
          <FiUploadCloud className="text-white text-4xl" />
        </div>
        <div className="text-xl font-bold font-display text-[var(--text-color)]">
          Drop files to upload
        </div>
        <p className="text-sm text-[var(--text-muted,#94a3b8)] mt-1">
          Release anywhere on the page
        </p>
      </div>
    </div>
  );
};

export default GlobalDropzone;
