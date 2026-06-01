import { useState, useCallback } from "react";

export interface ImageItem {
  id: string;
  previewUrl: string;
  file?: File;
  isCorrect: boolean;
  sortOrder: number;
  uploading?: boolean;
  key?: string;
  imageUrl?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  selectable?: boolean; // creator marking correct ones
  selectedIds?: Set<string>; // recipient selecting answers
  onToggleCorrect?: (id: string) => void;
  onToggleSelected?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function ImageGrid({
  images,
  selectable = false,
  selectedIds,
  onToggleCorrect,
  onToggleSelected,
  onRemove,
}: ImageGridProps) {
  const cols = images.length <= 4 ? 2 : images.length <= 9 ? 3 : 3;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "8px",
    }}>
      {images.map((img) => {
        const isMarked = selectable ? img.isCorrect : selectedIds?.has(img.id);

        return (
          <div
            key={img.id}
            onClick={() => {
              if (selectable && onToggleCorrect) onToggleCorrect(img.id);
              if (!selectable && onToggleSelected) onToggleSelected(img.id);
            }}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "10px",
              overflow: "hidden",
              cursor: "pointer",
              border: isMarked
                ? `2.5px solid var(--${selectable ? "success" : "primary"})`
                : "2.5px solid var(--border)",
              transition: "border-color 0.15s",
            }}
          >
            {/* Image */}
            {img.uploading ? (
              <div className="skeleton" style={{ width: "100%", height: "100%", background: "var(--surface2)" }} />
            ) : (
              <img
                src={img.previewUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "filter 0.15s",
                  filter: isMarked ? "none" : "brightness(0.85)",
                }}
                draggable={false}
              />
            )}

            {/* Checkmark overlay */}
            {isMarked && (
              <div className="scale-in" style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: selectable ? "var(--success)" : "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Remove button (creator only) */}
            {selectable && onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)",
                  border: "none",
                  color: "white",
                  fontSize: "13px",
                  lineHeight: "1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                ×
              </button>
            )}

            {/* Uploading overlay */}
            {img.uploading && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15,15,19,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Spinner size={20} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Spinner({ size = 24, color = "var(--primary)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
