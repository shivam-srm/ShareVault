import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { differenceInDays } from "date-fns";
import { updateFileExpiry, getUserFiles } from "../../redux/slice/file/fileThunk";
import { FiClock, FiX, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

const DISMISS_KEY = "sv-expiring-dismissed-at";

const ExpiringBanner = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((s) => s.file);
  const { user } = useSelector((s) => s.auth);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    // Re-appear after 24h
    if (ts && Date.now() - ts < 24 * 60 * 60 * 1000) setDismissed(true);
  }, []);

  const expiring = useMemo(
    () =>
      (files || []).filter((f) => {
        if (!f.expiresAt) return false;
        const d = differenceInDays(new Date(f.expiresAt), new Date());
        return d >= 0 && d <= 3;
      }),
    [files]
  );

  if (dismissed || expiring.length === 0) return null;

  const renewAll = async () => {
    setBusy(true);
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let ok = 0;
    for (const f of expiring) {
      try {
        const res = await dispatch(updateFileExpiry({ fileId: f._id, expiresAt: newExpiry }));
        if (!res?.error) ok += 1;
      } catch {
        /* ignore */
      }
    }
    setBusy(false);
    if (user?._id) dispatch(getUserFiles(user._id));
    if (ok) toast.success(`Renewed ${ok} file(s) for 30 days`);
    else toast.error("Could not renew files");
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 p-4 rounded-2xl glass-strong border border-amber-400/30 bg-amber-500/5 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
        <FiClock />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-color)]">
          {expiring.length} file{expiring.length > 1 ? "s" : ""} expiring within 3 days
        </div>
        <div className="text-xs text-[var(--text-muted,#94a3b8)] truncate">
          {expiring
            .slice(0, 3)
            .map((f) => f.name)
            .join(", ")}
          {expiring.length > 3 && ` +${expiring.length - 3} more`}
        </div>
      </div>
      <button
        onClick={renewAll}
        disabled={busy}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] disabled:opacity-50"
      >
        <FiRefreshCw className={busy ? "animate-spin" : ""} />
        {busy ? "Renewing…" : "Renew 30 days"}
      </button>
      <button
        onClick={dismiss}
        className="p-2 text-[var(--text-muted,#94a3b8)] hover:text-white"
        aria-label="Dismiss"
      >
        <FiX />
      </button>
    </div>
  );
};

export default ExpiringBanner;
