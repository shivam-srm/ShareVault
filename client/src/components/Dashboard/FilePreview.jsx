import { useEffect, useState } from "react";

const FilePreview = ({ file }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen aurora-bg">
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] animate-float" />
          <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)] animate-pulse">
            Loading preview…
          </h1>
        </div>
      </div>
    );
  }

  return (
    <h1 className="text-xl font-display text-[var(--text-color)]">File Preview</h1>
  );
};

export default FilePreview;
