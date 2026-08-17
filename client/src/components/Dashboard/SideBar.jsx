import React from "react";
import { FiHome, FiUploadCloud, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import Logo from "../Logo";

const Sidebar = ({ sidebarOpen, setSidebarOpen, setActiveTab, activeTab }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const tabs = [
    { name: "Home", icon: <FiHome />, id: "home" },
    { name: "Upload Files", icon: <FiUploadCloud />, id: "upload" },
    { name: "Profile", icon: <FiUser />, id: "profile" },
    { name: "Settings", icon: <FiSettings />, id: "settings" },
    { name: "Logout", icon: <FiLogOut />, id: "logout" },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-out w-64 z-40 md:translate-x-0 md:static md:inset-0 glass-strong border-r border-white/10 py-6`}
    >
      <div className="flex flex-col h-full">
        <div className="px-5 pb-6 flex items-center gap-3 border-b border-white/10">
          <Logo />
          <div>
            <div className="font-display font-bold text-lg text-white leading-tight">
              ShareVault
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted,#94a3b8)]">
              Dashboard
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-all
                  ${
                    active
                      ? "text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)]"
                      : "text-[var(--text-color)] hover:bg-white/5 hover:translate-x-0.5"
                  }`}
              >
                <span className={`text-lg ${active ? "text-white" : "text-[var(--primary-text)]"}`}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-5 pt-4 border-t border-white/10 text-[11px] text-[var(--text-muted,#94a3b8)]">
          <div className="opacity-70">Crafted by</div>
          <a
            href="https://techwithshivam.in/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--primary-text)] hover:underline"
          >
            Shivam Rai
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
