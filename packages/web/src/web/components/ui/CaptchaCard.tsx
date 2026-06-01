import type { ReactNode } from "react";
import { useLocation } from "wouter";

interface CaptchaCardProps {
  children: ReactNode;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export function CaptchaCard({ children, maxWidth = 480, style }: CaptchaCardProps) {
  const [, navigate] = useLocation();
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div className="scale-in" style={{
        width: "100%",
        maxWidth,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        ...style,
      }}>
        {children}
      </div>
      <div style={{
        marginTop: "18px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#9ca3af",
        fontSize: "11px",
      }}>
        <FriendLogo size={13} />
        <span style={{ color: "#6b7280" }}>FriendCAPTCHA</span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ color: "#9ca3af", cursor: "pointer" }} onClick={() => navigate("/")}>Privacy</span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ color: "#9ca3af", cursor: "pointer" }} onClick={() => navigate("/")}>Terms</span>
      </div>
    </div>
  );
}

export function FriendLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1a56db" />
      <circle cx="9" cy="10" r="2" fill="white" />
      <circle cx="15" cy="10" r="2" fill="white" />
      <path d="M8 15c1 1.5 2 2 4 2s3-0.5 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Legacy alias
export const CaptchaLogo = FriendLogo;
