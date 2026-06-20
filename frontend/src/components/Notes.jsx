import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Save,
  Trash2,
  FileUp,
  X,
  Loader2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  FileAudio,
  FileVideo,
  FileImage,
} from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";
import { api } from "../api";

import { API_BASE } from "../config";


// Helper to format file sizes
function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Helper to determine icon based on mimetype or extension
function getFileIcon(mimeType = "", filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return FileImage;
  }
  if (mimeType === "application/pdf" || ext === "pdf") {
    return FileText;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return FileSpreadsheet;
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return FileArchive;
  }
  if (["txt", "md", "html", "css", "js", "json"].includes(ext)) {
    return FileCode;
  }
  if (mimeType.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) {
    return FileAudio;
  }
  if (mimeType.startsWith("video/") || ["mp4", "mkv", "mov", "avi"].includes(ext)) {
    return FileVideo;
  }
  return File;
}

// Fullscreen Image Lightbox component
function ImageLightbox({ imageUrl, filename, onClose }) {
  const [zoom, setZoom] = useState(1);
  const modalRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    // Focus modal for keyboard accessibility
    modalRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer for ${filename}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 7, 13, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "fade-in 0.25s ease-out",
        padding: "2rem",
      }}
    >
      {/* Lightbox Controls Bar (stops click propagation so it doesn't close modal) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "0.5rem 1rem",
          borderRadius: "99px",
          color: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <span style={{ fontSize: "0.85rem", marginRight: "0.5rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {filename}
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => setZoom(1)}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          title="Fit to Screen"
          aria-label="Fit to Screen"
        >
          <Maximize size={18} />
        </button>
        <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.2)" }} />
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          title="Close Viewer"
          aria-label="Close Viewer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90%",
          maxHeight: "80%",
          transition: "transform 0.15s ease-out",
          transform: `scale(${zoom})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={imageUrl}
          alt={filename}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 40px rgba(109, 93, 252, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Notes — Field notes module with advanced file upload system,
 * inline progress feedback, and premium glassmorphic list components.
 */
export default function Notes({ notes, onAddNote, onDeleteNote }) {
  const [note, setNote] = useState({ title: "", content: "" });
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null); // { url, filename }
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const result = await api.uploadFile(file);
        // Save full metadata object
        setAttachments((prev) => [
          ...prev,
          {
            url: result.url,
            filename: result.filename,
            size: result.size,
            mimeType: result.mimeType,
          },
        ]);
      }
    } catch (err) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeAttachment(indexToRemove) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!note.title.trim() && !note.content.trim() && attachments.length === 0) return;
    onAddNote({
      title: note.title,
      content: note.content,
      attachments: attachments,
    });
    setNote({ title: "", content: "" });
    setAttachments([]);
  }

  async function triggerDownload(url, filename) {
    try {
      const res = await fetch(`${API_BASE}${url}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback direct link
      const a = document.createElement("a");
      a.href = `${API_BASE}${url}`;
      a.download = filename;
      a.target = "_blank";
      a.click();
    }
  }

  function formatDate(dateStr) {
    try {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  return (
    <section>
      {/* Add Note Form */}
      <form className="note-form" onSubmit={handleAdd}>
        <input
          id="add-note-title"
          placeholder="Title"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
        />
        <textarea
          id="add-note-content"
          placeholder="Write your thoughts here..."
          value={note.content}
          onChange={(e) => setNote({ ...note, content: e.target.value })}
        />

        {/* Uploaded Files Stage Preview */}
        {(attachments.length > 0 || isUploading) && (
          <div
            className="uploaded-files-stage"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.05em" }}>
              Staged Attachments ({attachments.length})
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.5rem" }}>
              {attachments.map((item, idx) => {
                const IconComponent = getFileIcon(item.mimeType, item.filename);
                const isImg = item.mimeType?.startsWith("image/");
                return (
                  <div
                    key={idx}
                    className="hover-lift"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "0.5rem",
                      position: "relative",
                    }}
                  >
                    {isImg ? (
                      <img
                        src={`${API_BASE}${item.url}`}
                        alt={item.filename}
                        style={{
                          width: "36px",
                          height: "36px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "4px",
                          background: "rgba(109, 93, 252, 0.15)",
                          display: "grid",
                          placeItems: "center",
                          color: "var(--accent)",
                        }}
                      >
                        <IconComponent size={18} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.filename}
                      </p>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {formatFileSize(item.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "none",
                        color: "var(--danger)",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Remove Attachment"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              {isUploading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px dashed var(--border)",
                    borderRadius: "6px",
                    padding: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  <Loader2
                    size={18}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--muted)",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Uploading...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <GlowButton type="submit">
            <Save size={18} /> Save Note
          </GlowButton>
          
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="note-file-upload-input"
          />
          <button
            type="button"
            className="secondary hover-lift"
            style={{
              minHeight: "2.65rem",
              padding: "0 1.25rem",
              background: "linear-gradient(135deg, rgba(109, 93, 252, 0.15), rgba(249, 115, 22, 0.05))",
              border: "1px solid rgba(109, 93, 252, 0.3)",
              boxShadow: "0 0 10px rgba(109, 93, 252, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <FileUp size={18} color="rgba(109, 93, 252, 0.9)" /> Upload Files
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="cards">
        {notes.length === 0 && (
          <GlassCard className="empty">
            <BookOpen size={32} />
            <strong>No notes saved yet.</strong>
          </GlassCard>
        )}
        {notes.map((item) => {
          // Backward compatibility support for old item.images if any
          const combinedAttachments = [
            ...(item.attachments || []),
            ...(item.images || []).map((imgUrl) => ({
              url: imgUrl,
              filename: imgUrl.split("/").pop() || "image.jpg",
              size: 0,
              mimeType: "image/jpeg",
            })),
          ];

          const imageAttachments = combinedAttachments.filter((att) =>
            att.mimeType?.startsWith("image/")
          );
          const documentAttachments = combinedAttachments.filter(
            (att) => !att.mimeType?.startsWith("image/")
          );

          return (
            <GlassCard
              key={item._id}
              className="note-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                padding: "1.25rem",
                position: "relative",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
                    {item.title || "Untitled"}
                  </h3>
                  <time style={{ display: "block", marginTop: "0.25rem" }}>
                    {formatDate(item.createdAt)}
                  </time>
                </div>
                <button
                  className="btn-icon icon-btn hover-lift"
                  title="Delete Note"
                  onClick={() => onDeleteNote(item._id)}
                  style={{ flexShrink: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Note Content */}
              {item.content && (
                <p style={{ margin: 0, width: "100%", fontSize: "0.95rem", color: "#e2daf0" }}>
                  {item.content}
                </p>
              )}

              {/* Redesigned Attachment Section */}
              {combinedAttachments.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.08em" }}>
                    Attachments
                  </span>

                  {/* Images Thumbnails Grid */}
                  {imageAttachments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        width: "100%",
                      }}
                    >
                      {imageAttachments.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="hover-lift hover-glow"
                          onClick={() => setActiveLightbox({ url: `${API_BASE}${img.url}`, filename: img.filename })}
                          style={{
                            position: "relative",
                            width: "160px",
                            height: "160px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid var(--border)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <img
                            src={`${API_BASE}${img.url}`}
                            alt={img.filename}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          />

                          {/* Float Download Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDownload(img.url, img.filename);
                            }}
                            style={{
                              position: "absolute",
                              bottom: "0.5rem",
                              right: "0.5rem",
                              background: "rgba(10, 7, 13, 0.75)",
                              backdropFilter: "blur(6px)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              borderRadius: "6px",
                              width: "28px",
                              height: "28px",
                              display: "grid",
                              placeItems: "center",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                            title={`Download ${img.filename}`}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document List Attachments */}
                  {documentAttachments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        width: "100%",
                      }}
                    >
                      {documentAttachments.map((doc, docIdx) => {
                        const IconComponent = getFileIcon(doc.mimeType, doc.filename);
                        return (
                          <div
                            key={docIdx}
                            className="hover-lift"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              borderRadius: "8px",
                              padding: "0.65rem 0.85rem",
                              gap: "0.75rem",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  background: doc.mimeType === "application/pdf" ? "rgba(239, 68, 68, 0.12)" : "rgba(109, 93, 252, 0.12)",
                                  color: doc.mimeType === "application/pdf" ? "var(--danger)" : "var(--accent)",
                                  display: "grid",
                                  placeItems: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <IconComponent size={18} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    color: "#e2daf0",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={doc.filename}
                                >
                                  {doc.filename}
                                </p>
                                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                  {formatFileSize(doc.size)}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => triggerDownload(doc.url, doc.filename)}
                              style={{
                                background: "rgba(255, 255, 255, 0.06)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "#ddd7ea",
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              className="icon-btn hover-lift"
                              title={`Download ${doc.filename}`}
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightbox && (
        <ImageLightbox
          imageUrl={activeLightbox.url}
          filename={activeLightbox.filename}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </section>
  );
}
