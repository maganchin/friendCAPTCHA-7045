import { useState, useEffect, useRef } from "react";

interface ImageItem {
  id: string;
  imageUrl: string;
}

type CellState = "normal" | "confirming" | "cycling" | "confirmed-empty" | "shaking";

interface Cell {
  image: ImageItem | null;
  state: CellState;
}

interface CaptchaGridProps {
  allImages: ImageItem[];
  correctIds: string[];
  onAllFound: () => void;
}

const GRID_SIZE = 9;

/** Shuffle an array in-place (Fisher-Yates) and return it */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build the ordered image list so ALL correct images appear in the first
 * GRID_SIZE slots. Remaining slots are filled with shuffled incorrect images.
 * Any leftover incorrect images become the queue.
 */
function buildOrderedImages(allImages: ImageItem[], correctIds: string[]): ImageItem[] {
  const correct = shuffle(allImages.filter((img) => correctIds.includes(img.id)));
  const incorrect = shuffle(allImages.filter((img) => !correctIds.includes(img.id)));

  // Fill grid: correct first, then incorrect to top up to GRID_SIZE
  const gridSlots = [...correct, ...incorrect.slice(0, Math.max(0, GRID_SIZE - correct.length))];
  // Shuffle the grid so correct images aren't always top-left
  shuffle(gridSlots);
  // Queue = remaining incorrect images
  const queue = incorrect.slice(Math.max(0, GRID_SIZE - correct.length));
  return [...gridSlots, ...queue];
}

export function CaptchaGrid({ allImages, correctIds, onAllFound }: CaptchaGridProps) {
  const ordered = buildOrderedImages(allImages, correctIds);
  const initialSlots = ordered.slice(0, GRID_SIZE).map((img) => ({
    image: img,
    state: "normal" as CellState,
  }));
  const initialQueue = ordered.slice(GRID_SIZE);

  const [cells, setCells] = useState<Cell[]>(initialSlots);
  const [queue, setQueue] = useState<ImageItem[]>(initialQueue);
  const foundRef = useRef<Set<string>>(new Set());
  const calledRef = useRef(false);

  // Reset when challenge changes (allImages / correctIds change)
  useEffect(() => {
    const reordered = buildOrderedImages(allImages, correctIds);
    const slots = reordered.slice(0, GRID_SIZE).map((img) => ({
      image: img,
      state: "normal" as CellState,
    }));
    setCells(slots);
    setQueue(reordered.slice(GRID_SIZE));
    foundRef.current = new Set();
    calledRef.current = false;
  }, [allImages, correctIds]);

  const handleTap = (index: number) => {
    const cell = cells[index];
    if (!cell.image || cell.state !== "normal") return;

    const isCorrect = correctIds.includes(cell.image.id);

    if (isCorrect) {
      const tappedId = cell.image.id;

      // Mark confirming (big checkmark)
      setCells((prev) => prev.map((c, i) => i === index ? { ...c, state: "confirming" } : c));

      setTimeout(() => {
        // Mark as found
        foundRef.current.add(tappedId);

        // Check if all found
        const allFound = correctIds.every((cid) => foundRef.current.has(cid));

        setQueue((prevQueue) => {
          const nextImage = prevQueue[0] ?? null;
          const newQueue = prevQueue.slice(1);

          setCells((prev) => prev.map((c, i) => {
            if (i !== index) return c;
            if (nextImage) {
              return { image: nextImage, state: "cycling" };
            }
            return { image: null, state: "confirmed-empty" };
          }));

          // After cycling animation, set back to normal
          setTimeout(() => {
            setCells((prev) => prev.map((c, i) =>
              i === index && c.state === "cycling" ? { ...c, state: "normal" } : c
            ));
          }, 500);

          return newQueue;
        });

        if (allFound && !calledRef.current) {
          calledRef.current = true;
          setTimeout(onAllFound, 900);
        }
      }, 700);

    } else {
      // Wrong tap — shake the cell
      setCells((prev) => prev.map((c, i) => i === index ? { ...c, state: "shaking" } : c));
      setTimeout(() => {
        setCells((prev) => prev.map((c, i) => i === index ? { ...c, state: "normal" } : c));
      }, 500);
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "3px",
      background: "#e8e8e8",
      padding: "3px",
    }}>
      <style>{`
        @keyframes cellShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-5px)}
          40%{transform:translateX(5px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        @keyframes cellCheckIn {
          0%{opacity:0;transform:scale(0.5)}
          60%{transform:scale(1.1)}
          100%{opacity:1;transform:scale(1)}
        }
        @keyframes fadeSlideIn {
          0%{opacity:0;transform:scale(1.04)}
          100%{opacity:1;transform:scale(1)}
        }
      `}</style>
      {cells.map((cell, i) => (
        <CaptchaCell key={i} cell={cell} onTap={() => handleTap(i)} />
      ))}
    </div>
  );
}

function CaptchaCell({ cell, onTap }: { cell: Cell; onTap: () => void }) {
  const isShaking = cell.state === "shaking";
  const isConfirming = cell.state === "confirming";
  const isCycling = cell.state === "cycling";
  const isEmpty = cell.state === "confirmed-empty" || !cell.image;

  return (
    <div
      onClick={onTap}
      style={{
        position: "relative",
        aspectRatio: "1",
        background: "#ccc",
        cursor: isEmpty || isConfirming ? "default" : "pointer",
        overflow: "hidden",
        animation: isShaking ? "cellShake 0.5s ease" : "none",
      }}
    >
      {/* Image */}
      {cell.image && (
        <img
          key={cell.image.id}
          src={cell.image.imageUrl}
          alt=""
          draggable={false}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            userSelect: "none",
            animation: isCycling ? "fadeSlideIn 0.45s ease" : "none",
            opacity: isConfirming ? 0.4 : 1,
            transition: isConfirming ? "opacity 0.3s" : "none",
          }}
        />
      )}

      {/* Empty slot after confirmed + no queue */}
      {isEmpty && (
        <div style={{
          position: "absolute", inset: 0,
          background: "#d0d0d0",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Big checkmark overlay on correct tap */}
      {isConfirming && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(74,144,217,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "cellCheckIn 0.3s ease both",
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20" fill="white" fillOpacity="0.2"/>
            <path d="M12 22l7 7 13-14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Wrong tap red flash */}
      {isShaking && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(220,38,38,0.35)",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}
