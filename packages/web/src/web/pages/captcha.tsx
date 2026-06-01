import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ImageGrid } from "../components/ImageGrid";
import { Spinner } from "../components/ImageGrid";

type Stage = "intro" | "challenge" | "result";

interface VerifyResult {
  correct: boolean;
  score: number;
  unlockMessage: string | null;
}

const funnyFailMessages = [
  "You may know them less well than you thought.",
  "Did you two actually meet or just follow each other?",
  "Some friendships don't survive the CAPTCHA.",
  "Acquaintance detected. Friend status: denied.",
  "This is awkward. For both of us.",
];

const funnySuccessMessages = [
  "That's a real one right there.",
  "Friend status: CONFIRMED.",
  "The algorithm approves of this friendship.",
  "You passed. They probably still won't text back, but you passed.",
];

export default function CaptchaPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<Stage>("intro");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [funnyMsg] = useState(() => ({
    fail: funnyFailMessages[Math.floor(Math.random() * funnyFailMessages.length)],
    success: funnySuccessMessages[Math.floor(Math.random() * funnySuccessMessages.length)],
  }));

  const captchaQuery = useQuery({
    queryKey: ["captcha", id],
    queryFn: async () => {
      const res = await api.captchas[":id"].$get({ param: { id } });
      if (!res.ok) {
        if (res.status === 404) throw new Error("CAPTCHA not found");
        throw new Error("Failed to load CAPTCHA");
      }
      return res.json();
    },
    enabled: !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: async (selectedIds: string[]) => {
      const res = await api.captchas[":id"].verify.$post({
        param: { id },
        json: { selectedIds },
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data as VerifyResult);
      setStage("result");
    },
  });

  const handleToggleSelected = (imgId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imgId)) next.delete(imgId);
      else next.add(imgId);
      return next;
    });
  };

  const handleSubmit = () => {
    verifyMutation.mutate(Array.from(selectedIds));
  };

  const handleRetry = () => {
    setSelectedIds(new Set());
    setResult(null);
    setStage("challenge");
  };

  // Loading
  if (captchaQuery.isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Spinner size={36} />
      </div>
    );
  }

  // Error
  if (captchaQuery.isError) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <h2 style={{ margin: "0 0 8px" }}>CAPTCHA not found</h2>
        <p style={{ color: "var(--muted)" }}>This link may have expired or never existed.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "24px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Make Your Own
        </button>
      </div>
    );
  }

  const data = captchaQuery.data!;
  const { captcha, images } = data as {
    captcha: { id: string; creatorName: string; prompt: string };
    images: { id: string; imageUrl: string; sortOrder: number }[];
  };

  // Convert to ImageItem format
  const imageItems = images.map((img) => ({
    id: img.id,
    previewUrl: img.imageUrl,
    isCorrect: false,
    sortOrder: img.sortOrder,
  }));

  // INTRO SCREEN
  if (stage === "intro") {
    return (
      <div className="fade-in" style={{
        minHeight: "100vh",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "32px 24px",
          width: "100%",
          maxWidth: "380px",
        }}>
          {/* CAPTCHA-style header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "24px",
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}>🔒</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>FriendCAPTCHA</div>
              <div style={{ color: "var(--muted)", fontSize: "12px" }}>Human Verification Required</div>
            </div>
          </div>

          <h2 style={{ margin: "0 0 12px", fontSize: "1.4rem", fontWeight: 800 }}>
            {captcha.creatorName} wants to verify you're actually their friend.
          </h2>
          <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "14px", lineHeight: 1.6 }}>
            You'll be shown a series of images. Select the correct ones to prove your friendship.
          </p>

          <button
            onClick={() => setStage("challenge")}
            style={{
              width: "100%",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
            }}
          >
            Begin Verification →
          </button>

          <p style={{ color: "var(--muted)", fontSize: "11px", margin: "16px 0 0" }}>
            Protected by FriendCAPTCHA · Not a real Google product
          </p>
        </div>

        {/* Make your own */}
        <button
          onClick={() => navigate("/create")}
          style={{
            marginTop: "24px",
            background: "none",
            border: "none",
            color: "var(--muted)",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "underline",
          }}
        >
          Make your own CAPTCHA
        </button>
      </div>
    );
  }

  // CHALLENGE SCREEN
  if (stage === "challenge") {
    return (
      <div className="fade-in" style={{
        minHeight: "100vh",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "20px 16px 40px",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
          }}>🔒</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "13px" }}>Human Verification</div>
            <div style={{ color: "var(--muted)", fontSize: "11px" }}>friendcaptcha.verify</div>
          </div>
        </div>

        {/* Prompt */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "16px",
        }}>
          <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            Challenge
          </div>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>
            {captcha.prompt}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            Tap to select · {selectedIds.size} selected
          </div>
        </div>

        {/* Image grid */}
        <ImageGrid
          images={imageItems}
          selectable={false}
          selectedIds={selectedIds}
          onToggleSelected={handleToggleSelected}
        />

        {/* Submit */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || verifyMutation.isPending}
            style={{
              width: "100%",
              background: selectedIds.size === 0 ? "var(--surface2)" : "var(--primary)",
              color: selectedIds.size === 0 ? "var(--muted)" : "white",
              border: "none",
              borderRadius: "12px",
              padding: "15px",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.15s",
            }}
          >
            {verifyMutation.isPending ? (
              <><Spinner size={18} color="var(--muted)" /> Verifying...</>
            ) : (
              "Verify →"
            )}
          </button>

          {verifyMutation.isError && (
            <p style={{ color: "var(--accent)", fontSize: "13px", textAlign: "center", marginTop: "8px" }}>
              Something went wrong. Try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (stage === "result" && result) {
    const isCorrect = result.correct;

    return (
      <div className="fade-in" style={{
        minHeight: "100vh",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
      }}>
        {/* Result card */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${isCorrect ? "rgba(81,207,102,0.3)" : "rgba(255,107,107,0.3)"}`,
          borderRadius: "20px",
          padding: "32px 24px",
          width: "100%",
          maxWidth: "380px",
        }}>
          {/* Big icon */}
          <div className="scale-in" style={{ fontSize: "64px", marginBottom: "16px" }}>
            {isCorrect ? "🎉" : "😬"}
          </div>

          {/* Title */}
          <h2 style={{
            margin: "0 0 8px",
            fontSize: "1.6rem",
            fontWeight: 800,
            color: isCorrect ? "var(--success)" : "var(--accent)",
          }}>
            {isCorrect ? "Friend Verified" : "Verification Failed"}
          </h2>

          {/* Score */}
          <div style={{
            display: "inline-block",
            background: isCorrect ? "rgba(81,207,102,0.1)" : "rgba(255,107,107,0.1)",
            border: `1px solid ${isCorrect ? "rgba(81,207,102,0.25)" : "rgba(255,107,107,0.25)"}`,
            borderRadius: "999px",
            padding: "6px 18px",
            margin: "8px 0 16px",
            fontWeight: 700,
            fontSize: "15px",
            color: isCorrect ? "var(--success)" : "var(--accent)",
          }}>
            Friendship Score: {result.score}/100
          </div>

          {/* Funny message */}
          <p style={{ color: "var(--muted)", margin: "0 0 20px", fontSize: "14px", lineHeight: 1.6 }}>
            {isCorrect ? funnyMsg.success : funnyMsg.fail}
          </p>

          {/* Unlock message */}
          {isCorrect && result.unlockMessage && (
            <div style={{
              background: "rgba(108,99,255,0.1)",
              border: "1px solid rgba(108,99,255,0.25)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
              fontSize: "14px",
              lineHeight: 1.6,
            }}>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Message from {captcha.creatorName}
              </div>
              <div style={{ fontWeight: 600 }}>{result.unlockMessage}</div>
            </div>
          )}

          {/* Buttons */}
          {!isCorrect && (
            <button
              onClick={handleRetry}
              style={{
                width: "100%",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              Try Again
            </button>
          )}
        </div>

        {/* Create your own */}
        <button
          onClick={() => navigate("/create")}
          style={{
            marginTop: "24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Make Your Own CAPTCHA →
        </button>
      </div>
    );
  }

  return null;
}
