import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./SideBar";
import StatsGrid from "./StatesGrid";
import UserProfile from "./UserProfile";
import Settings from "./Settings";
import UploadPage from "./FileUpload/UploadPage";
import FileShow from "./FileShow";
import Logout from "./Logout";
import Footer from "../Footer";
import CommandPalette from "./CommandPalette";
import GlobalDropzone from "./GlobalDropzone";
import ActivityFeed from "./ActivityFeed";
import ShortcutsOverlay from "./ShortcutsOverlay";
import ExpiringBanner from "./ExpiringBanner";
import VaultAssistant from "./VaultAssistant";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timeout);
  }, []);


  useEffect(() => {
    const onNav = (e) => {
      if (typeof e?.detail === "string") setActiveTab(e.detail);
    };
    window.addEventListener("sharevault:navigate-tab", onNav);
    return () => window.removeEventListener("sharevault:navigate-tab", onNav);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen aurora-bg">
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] animate-float" />
          <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)]">
            Loading ShareVault…
          </h1>
        </div>
      </div>
    );
  }

  const tabTitle = {
    home: "Dashboard Overview",
    upload: "Upload Files",
    profile: "Your Profile",
    settings: "Account Settings",
    logout: "Signing Out",
  }[activeTab] || "Dashboard";

  return (
    <>
      <div className="min-h-screen flex aurora-bg text-[var(--text-color)]">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex flex-col flex-1 min-w-0 relative z-10">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main key={activeTab} className="flex-1 p-4 sm:p-6 mt-16 animate-fade-in">

            {activeTab !== "logout" && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: "60ms", animationFillMode: "backwards" }}>
                <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest rounded-full glass border border-white/10 text-[var(--primary-text)] mb-2">
                  ShareVault
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold font-display bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-aurora)" }}
                >
                  {tabTitle}
                </h2>
              </div>
            )}
            <div className="animate-fade-in" style={{ animationDelay: "140ms", animationFillMode: "backwards" }}>
              {activeTab === "upload" && <UploadPage />}
              {activeTab === "profile" && <UserProfile />}
              {activeTab === "settings" && <Settings />}
              {activeTab === "logout" && <Logout />}
              {activeTab === "home" && (
                <>
                  <ExpiringBanner />
                  <StatsGrid />
                  <ActivityFeed />
                  <FileShow />
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
      <CommandPalette />
      <GlobalDropzone />
      <ShortcutsOverlay />
      <VaultAssistant />
    </>
  );
};

export default Dashboard;
