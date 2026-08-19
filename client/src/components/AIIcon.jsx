import React from "react";

/**
 * Modern, bright, glowing AI Assistant Icon.
 * Features a radiant 4-point AI starburst with orbital rings and gradient glow.
 */
const AIIcon = ({ size = 24, className = "" }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(99,102,241,0.5)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-[10px] bg-[#0b0c1e] flex items-center justify-center overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-cyan-400/25 blur-[2px]" />

        <svg
          viewBox="0 0 24 24"
          width={Math.round(size * 0.65)}
          height={Math.round(size * 0.65)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="aiSpark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#A5F3FC" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="aiSubSpark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* Primary AI Starburst */}
          <path
            d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
            fill="url(#aiSpark)"
          />

          {/* Secondary mini spark top-right */}
          <path
            d="M19 3C19 4.65685 17.6569 6 16 6C17.6569 6 19 7.34315 19 9C19 7.34315 20.3431 6 22 6C20.3431 6 19 4.65685 19 3Z"
            fill="url(#aiSubSpark)"
          />

          {/* Micro spark bottom-left */}
          <circle cx="5.5" cy="18.5" r="1" fill="#38BDF8" />
        </svg>
      </div>
    </div>
  );
};

export default AIIcon;
