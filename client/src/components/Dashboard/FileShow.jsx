import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserFiles, deleteFile } from "../../redux/slice/file/fileThunk";
import { formatDistanceToNowStrict, differenceInDays } from "date-fns";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaInstagram,
  FaEnvelope,
  FaDownload,
} from "react-icons/fa";
import {
  FiSearch,
  FiEye,
  FiShare2,
  FiX,
  FiCopy,
  FiFolder,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiExternalLink,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiCpu,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AIAnalysisModal from "./AIAnalysisModal";

const isTextLike = (type = "", name = "") => {
  if (!type && !name) return false;
  if (type.startsWith("text/")) return true;
  if (
    [
      "application/json",
      "application/xml",
      "application/javascript",
      "application/x-yaml",
      "application/x-sh",
    ].includes(type)
  )
    return true;
  const ext = name.split(".").pop()?.toLowerCase();
  return [
    "txt","md","markdown","json","xml","yml","yaml","csv","log",
    "js","jsx","ts","tsx","css","scss","html","htm","py","rb","go",
    "java","c","cpp","h","hpp","cs","php","sh","bash","env","ini",
    "toml","sql","kt","swift","rs","vue","svelte",
  ].includes(ext);
};

const FileShow = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { files } = useSelector((state) => state.file);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [aiFile, setAiFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Preview state
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [imgZoom, setImgZoom] = useState(1);
  const [lightbox, setLightbox] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && user._id) {
      dispatch(getUserFiles(user._id));
    }
  }, [user, dispatch]);

  // Load text content when preview opens on a text-like file
  useEffect(() => {
    let aborted = false;
    setImgZoom(1);
    setLightbox(false);
    setTextContent("");
    if (previewFile && isTextLike(previewFile.type, previewFile.name)) {
      setTextLoading(true);
      fetch(previewFile.path)
        .then((r) => r.text())
        .then((t) => {
          if (!aborted) setTextContent(t.slice(0, 200000));
        })
        .catch(() => {
          if (!aborted) setTextContent("// Unable to load file content.");
        })
        .finally(() => !aborted && setTextLoading(false));
    }
    return () => {
      aborted = true;
    };
  }, [previewFile]);

  const sortFileName = (filename) =>
    filename.length > 20 ? `${filename.slice(0, 20)}...` : filename;

  function handleShare(shortUrl) {
    const frontendBaseUrl = window.location.origin;
    const fullUrl = `${frontendBaseUrl}${shortUrl}`;
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent("Download file: " + fullUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=Check this out!`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}`,
      instagram: "#",
      email: `mailto:?subject=Shared File&body=${encodeURIComponent("Here's your file: " + fullUrl)}`,
      copy: fullUrl,
      qr: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullUrl)}&size=150x150`,
    };
  }

  const downloadQRCode = async (shortUrl) => {
    const qrUrl = handleShare(shortUrl).qr;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Failed to download QR code.");
    }
  };

  const filteredFiles = useMemo(
    () =>
      files?.filter((file) => {
        const nameMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = filterType ? file.type === filterType : true;
        const statusMatch = filterStatus
          ? filterStatus === "expired"
            ? differenceInDays(new Date(file.expiresAt), new Date()) <= 0
            : differenceInDays(new Date(file.expiresAt), new Date()) > 0
          : true;
        return nameMatch && typeMatch && statusMatch;
      }) || [],
    [files, searchTerm, filterType, filterStatus]
  );

  const totalPages = Math.ceil((filteredFiles?.length || 0) / itemsPerPage);
  const paginatedFiles = filteredFiles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------- Bulk selection helpers ----------
  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allOnPageSelected =
    paginatedFiles.length > 0 && paginatedFiles.every((f) => selectedIds.has(f._id));
  const togglePage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paginatedFiles.forEach((f) => next.delete(f._id));
      else paginatedFiles.forEach((f) => next.add(f._id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectedFiles = useMemo(
    () => (files || []).filter((f) => selectedIds.has(f._id)),
    [files, selectedIds]
  );

  const bulkCopyLinks = async () => {
    if (!selectedFiles.length) return;
    const origin = window.location.origin;
    const lines = selectedFiles
      .map((f) => (f.shortUrl ? `${f.name}\t${origin}${f.shortUrl}` : null))
      .filter(Boolean)
      .join("\n");
    if (!lines) {
      toast.warn("Selected files have no share links yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(lines);
      toast.success(`Copied ${lines.split("\n").length} link(s) to clipboard`);
    } catch {
      toast.error("Could not access clipboard");
    }
  };

  const bulkExportCsv = () => {
    if (!selectedFiles.length) return;
    const origin = window.location.origin;
    const header = ["Name", "Type", "Size (bytes)", "Downloads", "Status", "ShareURL", "CreatedAt"];
    const rows = selectedFiles.map((f) => [
      f.name,
      f.type,
      f.size,
      f.downloadedContent,
      f.status,
      f.shortUrl ? `${origin}${f.shortUrl}` : "",
      f.createdAt,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sharevault-selection-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedFiles.length} row(s) as CSV`);
  };

  const bulkDelete = async () => {
    if (!selectedFiles.length) return;
    if (!window.confirm(`Delete ${selectedFiles.length} file(s)? This cannot be undone.`))
      return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    for (const f of selectedFiles) {
      try {
        const res = await dispatch(deleteFile(f._id));
        if (res?.error) fail += 1;
        else ok += 1;
      } catch {
        fail += 1;
      }
    }
    setBulkBusy(false);
    clearSelection();
    if (user && user._id) dispatch(getUserFiles(user._id));
    if (ok) toast.success(`Deleted ${ok} file(s)`);
    if (fail) toast.error(`${fail} file(s) failed to delete`);
  };

  return (
    <div className="mt-8 glass-strong border border-white/10 rounded-3xl p-4 sm:p-6 shadow-[var(--shadow-elevated)] animate-fade-in">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-[var(--text-color)] flex items-center gap-2">
            <FiFolder className="text-[var(--primary-text)]" /> Your Uploaded Files
          </h2>
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] mt-1">
            Showing {filteredFiles.length} file{filteredFiles.length !== 1 && "s"}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-text)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-black/30 border border-white/10 text-[var(--text-color)] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)] transition"
            placeholder="Search by file name"
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)]"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {[...new Set(files?.map((f) => f.type))].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-text)]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        {(filterType || filterStatus || searchTerm) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("");
              setFilterStatus("");
            }}
            className="px-4 py-2.5 rounded-xl text-red-300 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 p-3 rounded-2xl glass border border-white/15 animate-fade-in">
          <span className="text-sm text-[var(--text-color)] font-semibold">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={bulkCopyLinks}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--primary-text)] border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <FiCopy /> Copy links
          </button>
          <button
            onClick={bulkExportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--primary-text)] border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <FaDownload /> Export CSV
          </button>
          <button
            onClick={bulkDelete}
            disabled={bulkBusy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-200 border border-red-500/40 bg-red-500/15 hover:bg-red-500/25 transition disabled:opacity-50"
          >
            <FiTrash2 /> {bulkBusy ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted,#94a3b8)] hover:text-white transition"
          >
            <FiX /> Clear
          </button>
        </div>
      )}

      {!files || files.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-white/10">
          <div className="text-5xl mb-3 opacity-70">📭</div>
          <p className="text-[var(--text-muted,#94a3b8)]">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-[var(--text-color)]">
                <thead className="hidden md:table-header-group bg-white/5 backdrop-blur">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <button
                        onClick={togglePage}
                        className="text-[var(--primary-text)]"
                        title={allOnPageSelected ? "Deselect page" : "Select page"}
                      >
                        {allOnPageSelected ? <FiCheckSquare /> : <FiSquare />}
                      </button>
                    </th>
                    {[
                      "File Name",
                      "Size",
                      "Type",
                      "Downloads",
                      "Status",
                      "Actions",
                      "Expiry",
                      "Uploaded",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[var(--primary-text)]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedFiles?.map((file) => {
                    const formattedSize =
                      file.size > 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : file.size > 1024
                        ? `${(file.size / 1024).toFixed(2)} KB`
                        : `${file.size} Bytes`;

                    const isExpired =
                      differenceInDays(new Date(file.expiresAt), new Date()) <= 0;
                    const checked = selectedIds.has(file._id);

                    return (
                      <React.Fragment key={file._id}>
                        {/* Desktop Row */}
                        <tr
                          className={`hidden md:table-row transition ${
                            checked ? "bg-indigo-500/10" : "hover:bg-white/5"
                          }`}
                        >
                          <td className="px-3 py-3">
                            <button
                              onClick={() => toggleOne(file._id)}
                              className="text-[var(--primary-text)]"
                              aria-label={checked ? "Deselect" : "Select"}
                            >
                              {checked ? <FiCheckSquare /> : <FiSquare />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {sortFileName(file.name)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted,#94a3b8)]">
                            {formattedSize}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted,#94a3b8)]">
                            {file.type}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted,#94a3b8)]">
                            {file.downloadedContent}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                file.status === "active"
                                  ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
                                  : "text-red-300 border-red-400/30 bg-red-500/10"
                              }`}
                            >
                              {file.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--primary-text)] border border-white/10 bg-white/5 hover:bg-white/10 transition"
                              >
                                <FiEye /> Preview
                              </button>
                              <button
                                onClick={() => setShareFile(file)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:opacity-95 transition"
                              >
                                <FiShare2 /> Share
                              </button>
                              <button
                                onClick={() => setAiFile(file)}
                                title="AI Analysis"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-200 border border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition"
                              >
                                <FiCpu /> AI
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-red-300">
                            {isExpired
                              ? "Expired"
                              : `Expires in ${differenceInDays(
                                  new Date(file.expiresAt),
                                  new Date()
                                )} days`}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted,#94a3b8)]">
                            {formatDistanceToNowStrict(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
                          </td>
                        </tr>

                        {/* Mobile Card */}
                        <tr className="block md:hidden">
                          <td className="block p-4">
                            <div
                              className={`glass rounded-xl p-4 border space-y-2 ${
                                checked ? "border-indigo-400/60" : "border-white/10"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex items-start gap-2">
                                  <button
                                    onClick={() => toggleOne(file._id)}
                                    className="mt-1 text-[var(--primary-text)]"
                                    aria-label={checked ? "Deselect" : "Select"}
                                  >
                                    {checked ? <FiCheckSquare /> : <FiSquare />}
                                  </button>
                                  <div>
                                    <div className="font-semibold text-[var(--text-color)] break-all">
                                      📄 {sortFileName(file.name)}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted,#94a3b8)]">
                                      {file.type} • {formattedSize}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                                    file.status === "active"
                                      ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
                                      : "text-red-300 border-red-400/30 bg-red-500/10"
                                  }`}
                                >
                                  {file.status}
                                </span>
                              </div>
                              <div className="text-xs text-[var(--text-muted,#94a3b8)]">
                                Downloads: {file.downloadedContent}
                              </div>
                              <div className="text-xs text-[var(--text-muted,#94a3b8)]">
                                {isExpired
                                  ? "Expired"
                                  : `Expires in ${differenceInDays(
                                      new Date(file.expiresAt),
                                      new Date()
                                    )} days`}
                              </div>
                              <div className="text-xs text-[var(--text-muted,#94a3b8)]">
                                Uploaded{" "}
                                {formatDistanceToNowStrict(new Date(file.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[var(--primary-text)] border border-white/10 bg-white/5"
                                >
                                  <FiEye /> Preview
                                </button>
                                <button
                                  onClick={() => setShareFile(file)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)]"
                                >
                                  <FiShare2 /> Share
                                </button>
                                <button
                                  onClick={() => setAiFile(file)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-200 border border-indigo-400/30 bg-indigo-500/10"
                                >
                                  <FiCpu /> AI
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-5 px-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl font-medium text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-sm text-[var(--text-muted,#94a3b8)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl font-medium text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong border border-white/10 p-6 rounded-2xl shadow-[var(--shadow-elevated)] max-w-3xl w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)] break-all">
                  {previewFile.name}
                </h3>
                <p className="text-xs text-[var(--text-muted,#94a3b8)] mt-1">
                  {previewFile.type} • {(previewFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--primary-text)] transition"
                  title="Open in new tab"
                >
                  <FiExternalLink /> Open
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-[var(--text-color)] hover:text-red-400 transition"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black/30 border border-white/10">
              {previewFile.type.startsWith("image/") && (
                <div className="relative">
                  <img
                    src={previewFile.path}
                    alt={previewFile.name}
                    style={{ transform: `scale(${imgZoom})`, transformOrigin: "center" }}
                    className="w-full h-auto transition-transform cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-1 p-1 rounded-lg bg-black/60 backdrop-blur border border-white/10">
                    <button
                      onClick={() => setImgZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 text-white/80 hover:text-white"
                      title="Zoom out"
                    >
                      <FiZoomOut />
                    </button>
                    <button
                      onClick={() => setImgZoom(1)}
                      className="px-2 text-xs text-white/80 hover:text-white"
                    >
                      {Math.round(imgZoom * 100)}%
                    </button>
                    <button
                      onClick={() => setImgZoom((z) => Math.min(4, z + 0.25))}
                      className="p-1.5 text-white/80 hover:text-white"
                      title="Zoom in"
                    >
                      <FiZoomIn />
                    </button>
                    <button
                      onClick={() => setLightbox(true)}
                      className="p-1.5 text-white/80 hover:text-white"
                      title="Fullscreen"
                    >
                      <FiMaximize2 />
                    </button>
                  </div>
                </div>
              )}
              {previewFile.type.startsWith("video/") && (
                <video controls className="w-full h-auto">
                  <source src={previewFile.path} type={previewFile.type} />
                </video>
              )}
              {previewFile.type.startsWith("audio/") && (
                <audio controls className="w-full p-4">
                  <source src={previewFile.path} type={previewFile.type} />
                </audio>
              )}
              {previewFile.type === "application/pdf" && (
                <iframe
                  src={`${previewFile.path}#toolbar=1&navpanes=0&view=FitH`}
                  title="PDF Preview"
                  className="w-full h-[70vh]"
                />
              )}
              {isTextLike(previewFile.type, previewFile.name) && (
                <div className="max-h-[60vh] overflow-auto">
                  {textLoading ? (
                    <div className="p-6 text-sm text-[var(--text-muted,#94a3b8)] animate-pulse">
                      Loading content…
                    </div>
                  ) : (
                    <pre className="p-4 text-xs sm:text-sm leading-relaxed text-emerald-100/90 font-mono whitespace-pre-wrap break-words">
                      {textContent || "// Empty file"}
                    </pre>
                  )}
                </div>
              )}
              {!previewFile.type.startsWith("image/") &&
                !previewFile.type.startsWith("video/") &&
                !previewFile.type.startsWith("audio/") &&
                previewFile.type !== "application/pdf" &&
                !isTextLike(previewFile.type, previewFile.name) && (
                  <div className="p-10 text-center text-[var(--text-muted,#94a3b8)] text-sm">
                    No inline preview for this type. Use{" "}
                    <span className="text-[var(--primary-text)]">Open</span> above to view.
                  </div>
                )}
            </div>
          </div>

          {/* Lightbox */}
          {lightbox && previewFile.type.startsWith("image/") && (
            <div
              className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setLightbox(false)}
            >
              <img
                src={previewFile.path}
                alt={previewFile.name}
                className="max-w-full max-h-full object-contain cursor-zoom-out"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <FiX size={22} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-strong border border-white/10 p-6 rounded-2xl shadow-[var(--shadow-elevated)] w-full max-w-md md:max-w-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-display text-[var(--text-color)] break-all">
                Share <span className="text-[var(--primary-text)]">"{shareFile?.name}"</span>
              </h3>
              <button
                onClick={() => setShareFile(null)}
                className="text-[var(--text-color)] hover:text-red-400 transition"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: handleShare(shareFile.shortUrl).whatsapp, icon: <FaWhatsapp />, label: "WhatsApp", color: "text-green-400" },
                { href: handleShare(shareFile.shortUrl).instagram, icon: <FaInstagram />, label: "Instagram", color: "text-pink-400" },
                { href: handleShare(shareFile.shortUrl).telegram, icon: <FaTelegramPlane />, label: "Telegram", color: "text-sky-400" },
                { href: handleShare(shareFile.shortUrl).email, icon: <FaEnvelope />, label: "Email", color: "text-orange-300" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl glass border border-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
                >
                  <span className={`${s.color} text-2xl`}>{s.icon}</span>
                  <span className="font-semibold text-[var(--text-color)]">{s.label}</span>
                </a>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs uppercase tracking-widest text-[var(--primary-text)] mb-3">
                QR Code
              </p>
              <div className="inline-block p-3 rounded-2xl bg-white shadow-[var(--shadow-glow)]">
                <img
                  src={handleShare(shareFile.shortUrl).qr}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                <button
                  onClick={() => downloadQRCode(shareFile.shortUrl)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] transition"
                >
                  <FaDownload /> Download QR
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(handleShare(shareFile.shortUrl).copy);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-[var(--primary-text)] border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <FiCopy /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={Boolean(aiFile)}
        fileId={aiFile?._id}
        fileName={aiFile?.name}
        onClose={() => setAiFile(null)}
      />
    </div>
  );
};


export default FileShow;
