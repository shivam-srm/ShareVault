import React from "react";
import shieldPng from "../assets/sharevault-shield.png";
import ringPng from "../assets/sharevault-ring.png";

// ShareVault mark: static shield + rotating orbit ring layered on top.
// GPU-friendly (transform-only) and reduced-motion aware.
const Logo = ({ size = 48, className = "" }) => {
  return (
    <div
      className={`sv-logo relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        contain: "layout paint style",
        background: "transparent",
        perspective: `${size * 6}px`,
      }}
      aria-hidden="true"
    >
      <img
        src={shieldPng}
        alt="ShareVault"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="sv-float absolute inset-0 m-auto block"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          willChange: "transform",
          zIndex: 2,
        }}
      />
      <img
        src={ringPng}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="sv-ring absolute inset-0 m-auto block pointer-events-none"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          willChange: "transform, filter",
          transformStyle: "preserve-3d",
          zIndex: 1,
          filter: "drop-shadow(0 0 3px rgba(139,92,246,0.75)) drop-shadow(0 0 8px rgba(99,102,241,0.55))",
        }}
      />

      <style>{`
        @keyframes sv-ring-orbit {

          from { transform: rotateX(72deg) rotateZ(0deg); }
          to   { transform: rotateX(72deg) rotateZ(360deg); }
        }
        @keyframes sv-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(0, -1.5px, 0); }
        }
        .sv-ring  { animation: sv-ring-orbit 11s linear infinite; transform-origin: 50% 50%; backface-visibility: visible; }
        .sv-float { animation: sv-float 4s ease-in-out infinite; }
        .sv-logo:hover .sv-ring { animation-duration: 6s; }

        @media (prefers-reduced-motion: reduce) {
          .sv-ring, .sv-float { animation: none !important; }
          .sv-ring { transform: rotateX(72deg); }
        }
      `}</style>

    </div>
  );
};

export default Logo;
