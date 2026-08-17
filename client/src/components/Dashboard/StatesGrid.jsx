import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../redux/slice/auth/authThunk";
import WelcomeSection from "./WelcomeSection";
import { FiUpload, FiDownload, FiVideo, FiImage, FiFileText, FiClock } from "react-icons/fi";

const StatsGrid = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && user.id && !hasFetched.current) {
      dispatch(getUser(user.id));
      hasFetched.current = true;
    }
  }, [user, dispatch]);

  const cards = [
    { title: "Total Uploads", value: user?.totalUploads ?? 0, icon: <FiUpload /> },
    { title: "Total Downloads", value: user?.totalDownloads ?? 0, icon: <FiDownload /> },
    { title: "Videos Uploaded", value: user?.videoCount ?? 0, icon: <FiVideo /> },
    { title: "Images Uploaded", value: user?.imageCount ?? 0, icon: <FiImage /> },
    { title: "Documents Uploaded", value: user?.documentCount ?? 0, icon: <FiFileText /> },
    {
      title: "Last Login",
      value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A",
      icon: <FiClock />,
    },
  ].filter((card) => card.value !== undefined);

  return (
    <div className="mt-2">
      <WelcomeSection user={user} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group relative p-5 rounded-2xl glass border border-white/10 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-[var(--gradient-aurora)] opacity-70" />
            <div
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition"
              style={{ background: "var(--gradient-aurora)" }}
            />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--primary-text)] text-xl group-hover:bg-[var(--gradient-aurora)] group-hover:text-white transition-all">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold font-display text-[var(--text-color)] truncate">
                  {card.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] mt-1">
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;
