import { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNowStrict, differenceInDays } from "date-fns";
import { FiUpload, FiDownload, FiClock, FiActivity } from "react-icons/fi";

const ActivityFeed = () => {
  const { files } = useSelector((s) => s.file);

  const items = useMemo(() => {
    if (!files?.length) return [];
    const uploads = [...files]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map((f) => ({
        key: `u-${f._id}`,
        icon: <FiUpload />,
        color: "text-indigo-300",
        title: `Uploaded ${f.name}`,
        sub: formatDistanceToNowStrict(new Date(f.createdAt), { addSuffix: true }),
        ts: new Date(f.createdAt).getTime(),
      }));

    const downloaded = files
      .filter((f) => (f.downloadedContent || 0) > 0)
      .sort((a, b) => (b.downloadedContent || 0) - (a.downloadedContent || 0))
      .slice(0, 3)
      .map((f) => ({
        key: `d-${f._id}`,
        icon: <FiDownload />,
        color: "text-emerald-300",
        title: `${f.downloadedContent} download${f.downloadedContent > 1 ? "s" : ""} · ${f.name}`,
        sub: "All time",
        ts: new Date(f.updatedAt || f.createdAt).getTime() - 1,
      }));

    const expiring = files
      .filter((f) => {
        if (!f.expiresAt) return false;
        const d = differenceInDays(new Date(f.expiresAt), new Date());
        return d >= 0 && d <= 3;
      })
      .slice(0, 3)
      .map((f) => ({
        key: `e-${f._id}`,
        icon: <FiClock />,
        color: "text-amber-300",
        title: `${f.name} expires soon`,
        sub: `In ${differenceInDays(new Date(f.expiresAt), new Date())} day(s)`,
        ts: new Date(f.expiresAt).getTime(),
      }));

    return [...uploads, ...downloaded, ...expiring]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8);
  }, [files]);

  return (
    <div className="mt-8 glass-strong border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[var(--shadow-elevated)] animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <FiActivity className="text-[var(--primary-text)]" />
        <h2 className="text-lg font-bold font-display text-[var(--text-color)]">
          Recent Activity
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 text-sm text-[var(--text-muted,#94a3b8)]">
          Activity will appear here once you upload files.
        </div>
      ) : (
        <ol className="relative border-l border-white/10 ml-2 space-y-4">
          {items.map((it) => (
            <li key={it.key} className="ml-4">
              <span
                className={`absolute -left-[9px] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-black/60 border border-white/15 ${it.color}`}
              >
                <span className="text-[10px]">{it.icon}</span>
              </span>
              <div className="text-sm text-[var(--text-color)] break-all">{it.title}</div>
              <div className="text-xs text-[var(--text-muted,#94a3b8)]">{it.sub}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ActivityFeed;
