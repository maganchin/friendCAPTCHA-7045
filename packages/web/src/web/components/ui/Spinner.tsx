export function Spinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.7s linear infinite", display: "block", flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" strokeOpacity="0.2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
