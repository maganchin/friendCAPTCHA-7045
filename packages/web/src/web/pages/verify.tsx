import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CaptchaGrid } from "../components/CaptchaGrid";
import { Spinner } from "../components/ui/Spinner";
import { FriendLogo } from "../components/ui/CaptchaCard";

type Stage = "intro" | "challenge" | "result";

// Animated blue checkmark
function AnimatedCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: "block" }}>
      <circle cx="14" cy="14" r="13" fill="#4a90d9" />
      <path
        d="M8 14.5l4.5 4.5 7.5-9"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="20" strokeDashoffset="0"
        style={{ animation: "drawCheck 0.3s ease forwards" }}
      />
      <style>{`@keyframes drawCheck { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
@keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-5px)} 60%{transform:translateX(5px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }`}</style>
    </svg>
  );
}

// FriendCAPTCHA recycling arrows logo
function ReCaptchaIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M44 10 C50 14, 54 20, 54 28" stroke="#4a90d9" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <polygon points="54,22 58,30 50,30" fill="#4a90d9"/>
      <path d="M20 54 C14 50, 10 44, 10 36" stroke="#9ca3af" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <polygon points="10,42 6,34 14,34" fill="#9ca3af"/>
      <path d="M10 28 C10 18, 18 10, 28 10" stroke="#4a90d9" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <polygon points="22,6 30,10 22,14" fill="#4a90d9"/>
      <path d="M54 36 C54 46, 46 54, 36 54" stroke="#9ca3af" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <polygon points="42,58 34,54 42,50" fill="#9ca3af"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 14.93-3H15" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 12a8 8 0 0 1-14.93 3H9" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#555"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  return (
    <div style={{
      minHeight: "100vh", background: "#f3f4f6",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "inherit",
    }}>
      {children}
      <div style={{
        marginTop: "14px", display: "flex", alignItems: "center",
        gap: "8px", color: "#9ca3af", fontSize: "11px",
      }}>
        <FriendLogo size={13} />
        <span style={{ color: "#6b7280" }}>FriendCAPTCHA</span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ cursor: "pointer", color: "#9ca3af" }} onClick={() => navigate("/")}>Create your own</span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ color: "#9ca3af" }}>Privacy</span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<Stage>("intro");
  const [checked, setChecked] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);


  const { data, isLoading, isError } = useQuery({
    queryKey: ["captcha", id],
    queryFn: async () => {
      const res = await api.captchas[":id"].$get({ param: { id: id! } });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const handleCheckboxClick = () => {
    if (checked) return;
    setChecked(true);
    setTimeout(() => setStage("challenge"), 700);
  };

  const handleAllFound = () => {
    const total = challenges.length;
    if (currentChallengeIndex < total - 1) {
      setCurrentChallengeIndex((i) => i + 1);
    } else {
      setStage("result");
    }
  };

  const resetAll = () => {
    setStage("intro");
    setChecked(false);
    setCurrentChallengeIndex(0);
  };

  // LOADING
  if (isLoading) {
    return (
      <Shell>
        <div style={{
          width: "300px", background: "white",
          border: "1px solid #d3d3d3", borderRadius: "3px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          padding: "18px 16px", display: "flex", alignItems: "center", gap: "14px",
        }}>
          <Spinner size={22} color="#4a90d9" />
          <span style={{ fontSize: "14px", color: "#777" }}>Loading...</span>
        </div>
      </Shell>
    );
  }

  // ERROR
  if (isError || !data) {
    return (
      <Shell>
        <div style={{
          width: "300px", background: "white",
          border: "1px solid #d3d3d3", borderRadius: "3px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          padding: "20px 18px", textAlign: "center",
        }}>
          <div style={{ fontSize: "13px", color: "#777", marginBottom: "14px" }}>Verification link is invalid or expired.</div>
          <button onClick={() => navigate("/create")} style={{
            background: "#4a90d9", color: "white", border: "none",
            borderRadius: "3px", padding: "8px 18px", fontSize: "13px",
            cursor: "pointer", fontFamily: "inherit",
          }}>Create your own</button>
        </div>
      </Shell>
    );
  }

  const typed = data as {
    captcha: { id: string; resultMessage: string };
    images: { id: string; imageUrl: string }[];
    challenges: { id: string; question: string; sortOrder: number; correctImageIds: string[] }[];
  };
  const { captcha, images, challenges } = typed;
  const imageItems = images.map((img) => ({ id: img.id, imageUrl: img.imageUrl }));

  // INTRO — reCAPTCHA checkbox widget
  if (stage === "intro") {
    return (
      <Shell>
        <div style={{
          width: "300px", background: "white",
          border: "1px solid #d3d3d3", borderRadius: "3px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        }}>
          {/* Main row */}
          <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Checkbox */}
            <div
              onClick={handleCheckboxClick}
              style={{
                width: "28px", height: "28px", flexShrink: 0,
                cursor: checked ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: checked ? "none" : "2px solid #c1c1c1",
                borderRadius: "3px", background: "white",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => !checked && (e.currentTarget.style.borderColor = "#aaa")}
              onMouseLeave={(e) => !checked && (e.currentTarget.style.borderColor = "#c1c1c1")}
            >
              {checked && <AnimatedCheck />}
            </div>

            {/* Label */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                I'm not a robot
              </div>
              {checked && !stage && (
                <div style={{ fontSize: "11px", color: "#4a90d9", marginTop: "4px" }}>
                  Verifying...
                </div>
              )}
            </div>

            {/* Branding */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              <ReCaptchaIcon size={32} />
              <div style={{ fontSize: "8px", color: "#555", fontWeight: 700, letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.3 }}>
                Friend<br />CAPTCHA
              </div>
              <div style={{ fontSize: "7px", color: "#999", textAlign: "center" }}>Privacy · Terms</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "#f9f9f9", borderTop: "1px solid #e8e8e8",
            padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: "9px", color: "#aaa" }}>
              Protected by <span style={{ fontWeight: 700, color: "#888" }}>FriendCAPTCHA</span>
            </div>
            <div style={{ fontSize: "8px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4caf50", display: "inline-block" }} />
              Secure
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // CHALLENGE — image grid popup
  if (stage === "challenge") {
    const challenge = challenges[currentChallengeIndex];
    const total = challenges.length;

    return (
      <Shell>
        <div style={{
          width: "330px", background: "white",
          border: "1px solid #ccc", borderRadius: "3px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", overflow: "hidden",
        }}>
          {/* Dark header */}
          <div style={{ background: "#4a4a4a", padding: "14px 16px 12px" }}>
            <div style={{
              fontSize: "10px", color: "#aaa", fontWeight: 400,
              letterSpacing: "0.02em", marginBottom: "5px", textTransform: "uppercase",
            }}>
              Select all squares with
            </div>
            <div style={{ fontSize: "21px", fontWeight: 300, color: "white", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {challenge.question}
            </div>
            {total > 1 && (
              <div style={{ display: "flex", gap: "4px", marginTop: "10px" }}>
                {challenges.map((_, i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: i < currentChallengeIndex ? "#4caf50" : i === currentChallengeIndex ? "white" : "#666",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* CaptchaGrid */}
          <CaptchaGrid
            allImages={imageItems}
            correctIds={challenge.correctImageIds}
            onAllFound={handleAllFound}
          />

          {/* Bottom toolbar */}
          <div style={{
            background: "#f9f9f9", borderTop: "1px solid #e0e0e0",
            padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Left icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button title="Reload" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                <RefreshIcon />
              </button>
              <button title="Audio" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                <AudioIcon />
              </button>
            </div>

            {/* Right: branding only */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ReCaptchaIcon size={16} />
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#555", letterSpacing: "0.03em" }}>FriendCAPTCHA</span>
              </div>
              <div style={{ fontSize: "7px", color: "#aaa" }}>Privacy · Terms</div>
            </div>
          </div>

          {/* Challenge counter */}
          <div style={{
            background: "#f0f0f0", borderTop: "1px solid #e8e8e8",
            padding: "5px 14px", fontSize: "10px", color: "#999", textAlign: "center",
          }}>
            {total > 1 ? `Challenge ${currentChallengeIndex + 1} of ${total} · ` : ""}
            If there are none, click <strong style={{ color: "#777" }}>Skip</strong>
          </div>
        </div>
      </Shell>
    );
  }

  // RESULT — the prank payoff
  if (stage === "result") {
    return (
      <Shell>
        <div style={{
          width: "310px", background: "white",
          border: "1px solid #ccc", borderRadius: "3px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", overflow: "hidden",
        }}>
          {/* Dark header */}
          <div style={{ background: "#4a4a4a", padding: "14px 16px 12px" }}>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              Verification Result
            </div>
            <div style={{ fontSize: "16px", fontWeight: 300, color: "white", lineHeight: 1.2 }}>
              FriendCAPTCHA Security Check
            </div>
          </div>

          {/* Result message — the prank */}
          <div style={{ padding: "20px 18px" }}>
            {/* Confused dog image */}
            <div style={{ margin: "0 auto 14px", textAlign: "center" }}>
              <img
                src="/confused-dog.png"
                alt=""
                style={{ width: "100%", maxWidth: "274px", borderRadius: "4px", display: "block", margin: "0 auto" }}
              />
            </div>

            {/* The creator's custom message */}
            <div style={{
              fontSize: "13px", color: "#374151", lineHeight: 1.65,
              textAlign: "center", marginBottom: "20px",
              padding: "0 4px",
            }}>
              {captcha.resultMessage}
            </div>

            {/* Fake reference number */}
            <div style={{
              background: "#f9f9f9", border: "1px solid #e8e8e8",
              borderRadius: "3px", padding: "8px 12px",
              marginBottom: "18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "10px", color: "#aaa" }}>Reference ID</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#555", fontFamily: "monospace" }}>
                FC-{Math.random().toString(36).slice(2, 10).toUpperCase()}
              </span>
            </div>

            <button onClick={resetAll} style={{
              width: "100%", marginBottom: "8px",
              background: "white", color: "#555",
              border: "1px solid #d3d3d3", borderRadius: "3px",
              padding: "9px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.12s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
            >
              Try again
            </button>
            <button onClick={() => navigate("/create")} style={{
              width: "100%", background: "#4a90d9", color: "white",
              border: "none", borderRadius: "3px",
              padding: "9px", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              letterSpacing: "0.04em", textTransform: "uppercase",
              transition: "background 0.12s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#3a7bc8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#4a90d9"; }}
            >
              Create yours
            </button>
          </div>

          {/* Bottom bar */}
          <div style={{
            background: "#f9f9f9", borderTop: "1px solid #e8e8e8",
            padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ReCaptchaIcon size={14} />
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#888" }}>FriendCAPTCHA</span>
            </div>
            <div style={{ fontSize: "8px", color: "#aaa" }}>Privacy · Terms</div>
          </div>
        </div>
      </Shell>
    );
  }

  return null;
}
