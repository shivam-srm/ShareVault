import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { deleteUser, updateUser } from "../../redux/slice/auth/authThunk";
import {
  FiEdit3,
  FiTrash2,
  FiMail,
  FiAtSign,
  FiHash,
  FiCopy,
  FiSettings,
  FiShield,
  FiLogOut,
  FiCamera,
  FiX,
} from "react-icons/fi";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const fileInputRef = useRef(null);
  const avatarKey = user?._id ? `sharevault:avatar:${user._id}` : null;
  const [localAvatar, setLocalAvatar] = useState(
    avatarKey ? localStorage.getItem(avatarKey) : null
  );

  useEffect(() => {
    if (avatarKey) setLocalAvatar(localStorage.getItem(avatarKey));
  }, [avatarKey]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      try {
        if (avatarKey) localStorage.setItem(avatarKey, dataUrl);
        setLocalAvatar(dataUrl);
        toast.success("Profile photo updated");
      } catch {
        toast.error("Could not save image (too large)");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAvatar = () => {
    if (avatarKey) localStorage.removeItem(avatarKey);
    setLocalAvatar(null);
    toast.success("Profile photo removed");
  };

  if (!user) {
    return (
      <div className="glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-elevated)] animate-fade-in text-[var(--text-color)]">
        <h3 className="text-xl font-bold font-display mb-2">Guest preview</h3>
        <p className="text-sm text-[var(--text-muted,#94a3b8)]">
          Sign in to view and manage your profile.
        </p>
      </div>
    );
  }

  const handleUpdate = () => {
    dispatch(updateUser({ userId: user._id, username: newUsername }));
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteUser(user._id));
    setDeleteModalOpen(false);
  };

  return (
    <div className="glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-elevated)] animate-fade-in">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-[var(--gradient-aurora)] blur-lg opacity-70 animate-pulse" />
          <img
            src={localAvatar || user.profilePic}
            alt="Profile"
            className="relative w-28 h-28 rounded-full border-2 border-white/30 shadow-[var(--shadow-elevated)] object-cover"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] flex items-center justify-center text-white hover:scale-110 transition"
          >
            <FiCamera />
          </button>
          {localAvatar && (
            <button
              type="button"
              onClick={removeAvatar}
              aria-label="Remove profile photo"
              className="absolute top-0 right-0 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/80 transition"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-2xl font-bold font-display text-[var(--text-color)]">
            {user.fullname}
          </h3>
          <p className="flex items-center gap-2 text-[var(--text-muted,#94a3b8)] text-sm">
            <FiAtSign className="text-[var(--primary-text)]" /> {user.username}
          </p>
          <p className="flex items-center gap-2 text-[var(--text-color)] text-sm break-all">
            <FiMail className="text-[var(--primary-text)]" /> {user.email}
          </p>
          <p className="flex items-center gap-2 text-xs text-[var(--text-muted,#94a3b8)] break-all">
            <FiHash className="text-[var(--primary-text)]" /> {user._id}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <div className="text-xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] mb-3">
          Quick actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Edit username",
              icon: <FiEdit3 />,
              onClick: () => setEditModalOpen(true),
            },
            {
              label: "Copy email",
              icon: <FiCopy />,
              onClick: () => {
                navigator.clipboard?.writeText(user.email);
                toast.success("Email copied");
              },
            },
            {
              label: "Copy user ID",
              icon: <FiHash />,
              onClick: () => {
                navigator.clipboard?.writeText(user._id);
                toast.success("User ID copied");
              },
            },
            {
              label: "Settings",
              icon: <FiSettings />,
              onClick: () =>
                window.dispatchEvent(
                  new CustomEvent("sharevault:navigate-tab", { detail: "settings" })
                ),
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition text-left"
            >
              <span className="text-lg text-[var(--primary-text)] group-hover:scale-110 transition">
                {a.icon}
              </span>
              <span className="text-sm font-medium text-[var(--text-color)]">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manage account */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <FiShield className="text-[var(--primary-text)]" />
          <div className="text-sm font-semibold text-[var(--text-color)]">
            Manage account
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
          >
            <FiEdit3 /> Edit Profile
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-red-300 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition"
          >
            <FiTrash2 /> Delete Account
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted,#94a3b8)] flex items-center gap-2">
          <FiLogOut /> Use the Logout tab in the sidebar to sign out.
        </p>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="glass-strong border border-white/10 p-6 rounded-2xl shadow-[var(--shadow-elevated)] w-full max-w-sm space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)]">
              Update Username
            </h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[var(--text-color)] bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="glass-strong border border-red-500/30 p-6 rounded-2xl shadow-[var(--shadow-elevated)] w-full max-w-sm space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-red-300">Confirm Deletion</h3>
            <p className="text-[var(--text-muted,#94a3b8)] text-sm">
              This will permanently delete your account and files. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[var(--text-color)] bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
