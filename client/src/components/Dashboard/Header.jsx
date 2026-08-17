import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "../Logo";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector((state) => state.auth);

  const avatarKey = user?._id ? `sharevault:avatar:${user._id}` : null;
  const localAvatar = avatarKey ? localStorage.getItem(avatarKey) : null;
  const finalAvatar = localAvatar || user?.profilePic;

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 glass-strong border-b border-white/10 text-[var(--text-color)]">
      {/* Hamburger for Mobile */}
      <button
        className="focus:outline-none md:hidden text-[var(--text-color)]"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile branding (sidebar handles desktop) */}
      <Link to="/" className="flex items-center gap-2 md:hidden min-w-0">
        <Logo size={32} />
        <span className="text-lg font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)] truncate">ShareVault</span>
      </Link>
      <div className="hidden md:block" />

      {/* User Info */}
      <div className="flex items-center space-x-2 cursor-pointer" tabIndex={0} role="button">
        {finalAvatar ? (
          <img
            src={finalAvatar}
            alt="User avatar"
            className="w-9 h-9 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--primary-text)] flex items-center justify-center text-white font-bold">
            {user?.fullname?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="hidden md:block">
          <h3 className="text-sm font-medium">{user?.fullname || "User"}</h3>
          <p className="text-xs text-[var(--text-dim)]">{user?.email || "user@example.com"}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
