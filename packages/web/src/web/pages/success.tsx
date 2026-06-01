import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { FriendLogo } from "../components/ui/CaptchaCard";

export default function SuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const captchaUrl = `${window.location.origin}/v/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(captchaUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = captchaUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
        maxWidth: "460px",
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FriendLogo size={20} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>FriendCAPTCHA</span>
          </div>
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "999px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            Active
          </div>
        </div>

        <div style={{ padding: "28px 24px" }}>
          {/* Success icon */}
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "#f0fdf4",
            border: "2px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#111827" }}>
            Your CAPTCHA is ready!
          </h2>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 24px", lineHeight: 1.65 }}>
            Share the link below with anyone you want to verify. Only your real friends should be able to pass.
          </p>

          {/* URL box */}
          <div style={{
            background: "#f9fafb",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M5.5 8.5l3-3M4 7l-1.5 1.5a2.12 2.12 0 0 0 3 3L7 10M7 4l1.5-1.5a2.12 2.12 0 0 1 3 3L10 7" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <code style={{
              fontSize: "12px",
              color: "#374151",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              letterSpacing: "-0.01em",
            }}>
              {captchaUrl}
            </code>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "#f0fdf4" : "white",
                border: `1px solid ${copied ? "#bbf7d0" : "#e5e7eb"}`,
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: copied ? "#16a34a" : "#374151",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "inherit",
              }}
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1 5.5l3 3 5.5-5.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" stroke="#6b7280" strokeWidth="1.2" fill="none" />
                    <path d="M2 7.5V2A1.5 1.5 0 0 1 3.5.5H7.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => navigate(`/v/${id}`)}
              style={{
                width: "100%",
                background: "#000000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
                letterSpacing: "-0.01em",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3a3a3c")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#000000")}
            >
              Preview your CAPTCHA
            </button>

            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                background: "white",
                color: "#374151",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                padding: "11px 20px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                letterSpacing: "-0.01em",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              {copied ? "✓ Link copied!" : "Copy link to share"}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/create")}
        style={{
          marginTop: "20px",
          background: "none",
          border: "none",
          color: "#9ca3af",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        Create another CAPTCHA
      </button>
    </div>
  );
}
