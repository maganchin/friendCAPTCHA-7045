interface PhotoItem {
  id: string;
  previewUrl: string;
  uploading?: boolean;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  /** If true, remove button shown */
  onRemove?: (id: string) => void;
  cols?: number;
}

export function PhotoGrid({ photos, selectedIds, onToggle, onRemove, cols }: PhotoGridProps) {
  const gridCols = cols ?? (photos.length <= 4 ? 2 : photos.length <= 9 ? 3 : 4);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gap: "6px",
    }}>
      {photos.map((photo) => {
        const isSelected = selectedIds.has(photo.id);
        return (
          <div
            key={photo.id}
            onClick={() => !photo.uploading && onToggle(photo.id)}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: photo.uploading ? "default" : "pointer",
              border: isSelected ? "2px solid var(--accent)" : "2px solid var(--border)",
              transition: "border-color 0.12s",
              background: "#f4f4f5",
            }}
          >
            {photo.uploading ? (
              <div className="skeleton" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
            ) : (
              <img
                src={photo.previewUrl}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "opacity 0.12s",
                  opacity: isSelected ? 1 : 0.88,
                  userSelect: "none",
                }}
              />
            )}

            {/* Blue overlay tint when selected */}
            {isSelected && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(37,99,235,0.08)",
                pointerEvents: "none",
              }} />
            )}

            {/* Checkmark */}
            {isSelected && (
              <div style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "checkPop 0.2s ease both",
                boxShadow: "0 1px 4px rgba(37,99,235,0.4)",
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Remove button (creator only) */}
            {onRemove && !photo.uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(photo.id); }}
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  color: "white",
                  fontSize: "12px",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
              >
                ×
              </button>
            )}

            {/* Upload loading overlay */}
            {photo.uploading && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.5)",
              }}>
                <UploadSpinner />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UploadSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
      <circle cx="10" cy="10" r="7" stroke="#d1d5db" strokeWidth="2" />
      <path d="M10 3a7 7 0 0 1 7 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
