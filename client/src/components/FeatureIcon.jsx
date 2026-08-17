import React from "react";
import { Zap, Lock, Link2, Globe, BarChart3, Sparkles } from "lucide-react";

// Animated feature icon — GPU-only (transform/opacity), respects reduced motion.
// Each `variant` gets a distinct signature animation on the icon glyph.
const VARIANTS = {
  zap:      { Icon: Zap,       anim: "fi-bolt",   color: "#f59e0b" },
  lock:     { Icon: Lock,      anim: "fi-lock",   color: "#a78bfa" },
  link:     { Icon: Link2,     anim: "fi-link",   color: "#60a5fa" },
  globe:    { Icon: Globe,     anim: "fi-globe",  color: "#34d399" },
  chart:    { Icon: BarChart3, anim: "fi-chart",  color: "#f472b6" },
  sparkle:  { Icon: Sparkles,  anim: "fi-spark",  color: "#c084fc" },
};

const FeatureIcon = ({ variant = "zap", size = 26 }) => {
  const { Icon, anim, color } = VARIANTS[variant] ?? VARIANTS.zap;
  return (
    <div
      className="fi-wrap relative inline-flex items-center justify-center rounded-2xl"
      style={{
        width: 56,
        height: 56,
        background: "var(--primary-soft)",
        contain: "layout paint style",
      }}
      aria-hidden="true"
    >
      <span
        className="fi-halo absolute inset-1 rounded-xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}55, transparent 70%)`,
          willChange: "opacity",
        }}
      />
      <Icon
        size={size}
        strokeWidth={2}
        color={color}
        className={`relative ${anim}`}
        style={{ willChange: "transform", transformOrigin: "center" }}
      />
      <style>{`
        .fi-halo { animation: fi-halo 3.2s ease-in-out infinite; opacity: .6; }
        @keyframes fi-halo { 0%,100% { opacity:.35 } 50% { opacity:.85 } }

        .fi-bolt  { animation: fi-bolt  1.8s ease-in-out infinite; }
        .fi-lock  { animation: fi-lock  2.6s ease-in-out infinite; }
        .fi-link  { animation: fi-link  3.4s linear infinite; }
        .fi-globe { animation: fi-globe 6s linear infinite; }
        .fi-chart { animation: fi-chart 2.2s ease-in-out infinite; }
        .fi-spark { animation: fi-spark 2.4s ease-in-out infinite; }

        @keyframes fi-bolt {
          0%,60%,100% { transform: translate3d(0,0,0) rotate(0); }
          70%         { transform: translate3d(0,-2px,0) rotate(-8deg); }
          80%         { transform: translate3d(0,1px,0)  rotate(6deg); }
        }
        @keyframes fi-lock {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50%     { transform: translate3d(0,-1px,0) scale(1.06); }
        }
        @keyframes fi-link {
          0%   { transform: rotate(-8deg) translate3d(0,0,0); }
          50%  { transform: rotate(8deg)  translate3d(0,-1px,0); }
          100% { transform: rotate(-8deg) translate3d(0,0,0); }
        }
        @keyframes fi-globe {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fi-chart {
          0%,100% { transform: translate3d(0,0,0) scaleY(1); }
          50%     { transform: translate3d(0,-1px,0) scaleY(1.12); }
        }
        @keyframes fi-spark {
          0%,100% { transform: rotate(0deg)   scale(1);    opacity: 1; }
          50%     { transform: rotate(90deg)  scale(1.15); opacity: .85; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fi-halo,
          .fi-bolt, .fi-lock, .fi-link,
          .fi-globe, .fi-chart, .fi-spark { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default FeatureIcon;
