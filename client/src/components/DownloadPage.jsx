import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiLock, FiDownload, FiShield, FiCalendar, FiHardDrive, FiFileText, FiUser } from "react-icons/fi";

const DownloadPage = () => {
  const { shortCode } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchFile = async () => {
      try {
        const res = await fetch(`/api/files/f/${shortCode}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        setFile(data);
        setIsProtected(data.isPasswordProtected);
        setIsLoading(false);
        if (data.isPasswordProtected) {
          toast.info("🔒 This file is password protected. Please enter the password.");
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    };
    fetchFile();
    return () => controller.abort();
  }, [shortCode]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.downloadUrl;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verifyFile = async () => {
    if (!password) {
      toast.warn("Please enter a password.");
      return;
    }
    try {
      const res = await fetch(`/api/files/verifyFilePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode, password }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("✅ Password verified! You can now download the file.");
        setIsVerified(true);
      } else {
        toast.error("❌ Incorrect password. Try again.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto border border-red-500/30">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  if (isLoading || !file) {
    return (
      <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
        <div className="animate-pulse text-[var(--primary-text)] font-medium">Loading file…</div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-[var(--shadow-elevated)] animate-fade-in">
      <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#94a3b8)]">
            <FiFileText className="text-[var(--primary-text)]" />
            <span className="font-medium text-[var(--text-color)] break-all">{file.name}</span>
          </div>

          <div className="w-full">
            <h2 className="text-sm uppercase tracking-widest text-[var(--primary-text)] mb-3">Preview</h2>
            {isProtected && !isVerified ? (
              <div className="w-full flex flex-col items-center justify-center p-10 rounded-2xl glass border border-dashed border-white/15 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[var(--gradient-aurora)] flex items-center justify-center mb-4 shadow-[var(--shadow-glow)] animate-float">
                  <FiLock className="text-white text-3xl" />
                </div>
                <p className="text-[var(--text-color)] text-base font-medium">Protected File</p>
                <p className="text-[var(--text-muted,#94a3b8)] text-sm mt-1">Verify the password to preview or download.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center min-h-[220px] p-2">
                {(file.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(file.name)) && (
                  <img
                    src={file.previewUrl || file.path}
                    alt={file.name}
                    className="max-w-full max-h-[500px] object-contain rounded-xl shadow-md mx-auto"
                    loading="lazy"
                  />
                )}
                {(file.type?.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name)) && (
                  <video controls className="w-full max-h-[480px] rounded-xl">
                    <source src={file.previewUrl || file.path} type={file.type} />
                    Your browser does not support video playback.
                  </video>
                )}
                {(file.type?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)) && (
                  <audio controls className="w-full p-4">
                    <source src={file.previewUrl || file.path} type={file.type} />
                    Your browser does not support audio playback.
                  </audio>
                )}
                {(file.type === "application/pdf" || /\.pdf$/i.test(file.name)) && (
                  <iframe
                    src={file.previewUrl || file.path}
                    title="PDF Preview"
                    className="w-full h-[500px] rounded-xl border-0"
                  />
                )}
                {!file.type?.startsWith("image/") &&
                  !file.type?.startsWith("video/") &&
                  !file.type?.startsWith("audio/") &&
                  file.type !== "application/pdf" &&
                  !/\.(png|jpe?g|webp|gif|svg|ico|mp4|webm|ogg|mov|mkv|avi|mp3|wav|m4a|pdf)$/i.test(file.name) && (
                    <div className="p-8 text-center text-[var(--text-muted,#94a3b8)]">
                      <FiFileText size={48} className="mx-auto mb-2 text-[var(--primary-text)] opacity-80" />
                      <p className="text-sm font-medium text-[var(--text-color)]">Preview not available for this file format</p>
                      <p className="text-xs mt-1">Click below to download the file directly.</p>
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#94a3b8)] mt-2">
            <FiUser className="text-[var(--primary-text)]" />
            <span>Uploaded by <span className="text-[var(--text-color)] font-medium">{file.uploadedBy}</span></span>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="glass rounded-2xl p-5 space-y-3 border border-white/10">
            <div className="flex items-center gap-3 text-sm">
              <FiCalendar className="text-[var(--primary-text)]" />
              <div>
                <div className="text-[var(--text-muted,#94a3b8)] text-xs uppercase tracking-wider">Uploaded on</div>
                <div className="text-[var(--text-color)]">{new Date(file.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiHardDrive className="text-[var(--primary-text)]" />
              <div>
                <div className="text-[var(--text-muted,#94a3b8)] text-xs uppercase tracking-wider">Size</div>
                <div className="text-[var(--text-color)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiFileText className="text-[var(--primary-text)]" />
              <div>
                <div className="text-[var(--text-muted,#94a3b8)] text-xs uppercase tracking-wider">Type</div>
                <div className="text-[var(--text-color)] break-all">{file.type}</div>
              </div>
            </div>
          </div>

          {isProtected && !isVerified && (
            <div className="glass rounded-2xl p-5 space-y-3 border border-white/10">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--primary-text)]">
                <FiShield /> Password Required
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-[var(--text-color)] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)] transition"
              />
              <button
                onClick={verifyFile}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-[var(--gradient-aurora)] hover:opacity-95 shadow-[var(--shadow-glow)] transition"
              >
                <FiShield /> Verify Password
              </button>
            </div>
          )}

          {(!isProtected || isVerified) && (
            <button
              onClick={handleDownload}
              className="group w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 transition-all"
            >
              <FiDownload className="text-xl group-hover:animate-bounce" />
              Download Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
