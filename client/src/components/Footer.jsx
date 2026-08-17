import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer
      className="relative mt-24 border-t border-[var(--border-color)] overflow-hidden"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 480px" }}
    >
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none sv-aurora" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group mb-4">
              <Logo size={44} className="transition-transform group-hover:scale-110" />
              <div>
                <span className="text-2xl font-display font-bold gradient-text">ShareVault</span>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)] -mt-0.5">Share instantly</p>
              </div>
            </Link>
            <p className="text-[var(--text-muted)] max-w-sm leading-relaxed">
              Send files at the speed of thought. Premium security, zero friction, beautifully simple.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)] mb-4">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[var(--primary-text)] transition">Home</Link></li>
              <li><Link to="/signup" className="hover:text-[var(--primary-text)] transition">Sign up</Link></li>
              <li><Link to="/login" className="hover:text-[var(--primary-text)] transition">Log in</Link></li>
              <li><Link to="/dashboard" className="hover:text-[var(--primary-text)] transition">Dashboard</Link></li>
            </ul>
          </div>
        </div>


        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} ShareVault. Crafted with ❤️ by <a href="https://techwithshivam.in/" target="_blank" rel="noopener noreferrer" className="text-[var(--primary-text)] font-medium hover:underline">Shivam Rai</a></p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 sv-status" />
            All systems operational
          </p>
        </div>
      </div>
      <style>{`
        .sv-status { animation: sv-status-pulse 2.4s ease-in-out infinite; will-change: opacity; }
        @keyframes sv-status-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        @media (prefers-reduced-motion: reduce) {
          .sv-status, .sv-aurora { animation: none !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
