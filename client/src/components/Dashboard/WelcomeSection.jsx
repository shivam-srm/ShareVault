import React from "react";
import { FiUser } from "react-icons/fi";

const WelcomeSection = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };

  const greeting = getGreeting();
  const displayName = user?.fullname || "Guest";
  const displayEmail = user?.email || "Sign in to sync your files";
  const displayUsername = user?.username || "guest";
  const initial = displayName.charAt(0).toUpperCase();

  const avatarKey = user?._id ? `sharevault:avatar:${user._id}` : null;
  const localAvatar = avatarKey ? localStorage.getItem(avatarKey) : null;
  const finalAvatar = localAvatar || user?.profilePic;

  return (
    <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 glass-strong border border-white/10 animate-fade-in">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_60%)] animate-aurora pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5 flex-wrap">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-[var(--gradient-aurora)] blur-md opacity-70 animate-pulse" />
          {finalAvatar ? (
            <img
              src={finalAvatar}
              alt="Profile"
              className="relative w-20 h-20 rounded-full border-2 border-white/40 shadow-[var(--shadow-elevated)] object-cover"
            />
          ) : (
            <div className="relative w-20 h-20 rounded-full border-2 border-white/40 shadow-[var(--shadow-elevated)] bg-[var(--gradient-aurora)] flex items-center justify-center text-white text-3xl font-bold font-display">
              {initial || <FiUser />}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white drop-shadow">
            {greeting}, {displayName}
          </h1>
          <p className="text-white/85 text-sm sm:text-base truncate">{displayEmail}</p>
          <p className="text-white/60 text-xs sm:text-sm">@{displayUsername}</p>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
