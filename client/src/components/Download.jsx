import DownloadPage from "./DownloadPage";
import Header from "./HeaderComp";
import Footer from "./Footer";

const Download = () => {
  return (
    <div className="min-h-screen flex flex-col aurora-bg text-[var(--text-color)]">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        <div className="mb-8 text-center animate-fade-in">
          <span className="inline-block px-3 py-1 mb-3 text-xs uppercase tracking-widest rounded-full glass border border-white/10 text-[var(--primary-text)]">
            Secure Transfer
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)]">
            Download File
          </h2>
          <p className="text-[var(--text-muted,#94a3b8)] mt-2 text-sm sm:text-base">
            Preview, verify, and download your shared file securely.
          </p>
        </div>
        <DownloadPage />
      </main>
      <Footer />
    </div>
  );
};

export default Download;
