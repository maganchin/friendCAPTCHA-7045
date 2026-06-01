import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { PhotoGrid } from "../components/PhotoGrid";
import { Spinner } from "../components/ui/Spinner";
import { FriendLogo } from "../components/ui/CaptchaCard";
import { uploadImage, toJpeg } from "../lib/upload";
import { api } from "../lib/api";
import { nanoid } from "nanoid";

type Step = 1 | 2 | 3;

interface Photo {
  id: string;
  previewUrl: string;
  file?: File;
  uploading: boolean;
  key?: string;
  imageUrl?: string;
  sortOrder: number;
}

interface Challenge {
  id: string;
  question: string;
  correctSortOrders: Set<number>;
}

const EXAMPLE_QUESTIONS = [
  "Select all photos where I'm drinking water",
  "Select photos from college",
  "Select my most embarrassing photo",
  "Select photos where I look like I haven't slept",
  "Select photos from my last vacation",
];

const RESULT_MESSAGE_EXAMPLES = [
  "Congratulations! You passed the Friendship Test™. You are now officially a Verified Friend via FriendCAPTCHA.",
  "Well well well... I guess you DO know me. Welcome to the inner circle. 🎉",
  "Analysis complete. Friendship status: CONFIRMED. You may now continue being my friend.",
  "Okay fine, I guess you actually pay attention. Certified Best Friend, effective immediately.",
  "Our AI has determined that you are, in fact, a real one. FriendCAPTCHA approves of you.",
  "Verification successful! You clearly stalk my Instagram. Friendship level: ELITE.",
];

function StepBar({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Upload Photos" },
    { n: 2, label: "Set Challenges" },
    { n: 3, label: "Result Message" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: s.n < current ? "#000000" : s.n === current ? "#000000" : "#e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "all 0.2s",
            }}>
              {s.n < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span style={{ fontSize: "11px", fontWeight: 700, color: s.n === current ? "white" : "#9ca3af" }}>{s.n}</span>
              )}
            </div>
            <span style={{
              fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
              color: s.n === current ? "#111827" : s.n < current ? "#000000" : "#9ca3af",
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: "1px", margin: "0 10px",
              background: s.n < current ? "#000000" : "#e5e7eb",
              transition: "background 0.2s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, loading, children }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", marginTop: "20px",
      background: disabled ? "#aeaeb2" : "#000000",
      color: "white", border: "none", borderRadius: "8px",
      padding: "12px 20px", fontSize: "14px", fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: "-0.01em",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      transition: "background 0.15s",
    }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = "#3a3a3c")}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.background = "#000000")}
    >
      {loading ? <><Spinner size={14} color="white" />{children}</> : children}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      marginTop: "14px", padding: "11px 14px",
      background: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: "8px", fontSize: "13px", color: "#dc2626",
      display: "flex", alignItems: "flex-start", gap: "8px",
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="7" cy="7" r="6.5" stroke="#dc2626" strokeWidth="1" />
        <path d="M7 4v4M7 9.5h.01" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  );
}

export default function CreatePage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: nanoid(), question: "", correctSortOrders: new Set() },
  ]);
  const [resultMessage, setResultMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = photos.some((p) => p.uploading);
  const readyPhotos = photos.filter((p) => !p.uploading && p.key);

  const handleFiles = useCallback(async (files: File[]) => {
    const remaining = 16 - photos.length;
    const toAdd = files.slice(0, remaining);
    if (!toAdd.length) return;
    const tempPhotos: Photo[] = toAdd.map((file, i) => ({
      id: nanoid(), previewUrl: URL.createObjectURL(file),
      file, uploading: true, sortOrder: photos.length + i,
    }));
    setPhotos((prev) => [...prev, ...tempPhotos]);
    setError(null);
    await Promise.all(
      tempPhotos.map(async (tp) => {
        try {
          // Convert to JPEG first — fixes HEIC previews and upload
          const { blob } = await toJpeg(tp.file!);
          const jpegFile = new File([blob], tp.file!.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
          const previewUrl = URL.createObjectURL(blob);
          // Update preview immediately with JPEG blob URL
          setPhotos((prev) => prev.map((p) => p.id === tp.id ? { ...p, previewUrl } : p));
          const { key, imageUrl } = await uploadImage(jpegFile);
          setPhotos((prev) => prev.map((p) => p.id === tp.id ? { ...p, uploading: false, key, imageUrl } : p));
        } catch {
          setPhotos((prev) => prev.filter((p) => p.id !== tp.id));
          setError("Some images failed to upload. Please try again.");
        }
      })
    );
  }, [photos.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handleFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) handleFiles(files);
  };

  const handleStep1Continue = () => {
    setError(null);
    if (readyPhotos.length < 4) { setError(`Upload at least 4 photos (${readyPhotos.length} ready).`); return; }
    if (isUploading) { setError("Wait for uploads to finish."); return; }
    setStep(2); window.scrollTo(0, 0);
  };

  const handleStep2Continue = () => {
    setError(null);
    for (const ch of challenges) {
      if (!ch.question.trim()) { setError("Fill in all challenge questions."); return; }
      if (ch.correctSortOrders.size === 0) { setError("Select at least 1 correct photo per challenge."); return; }
    }
    setStep(3); window.scrollTo(0, 0);
  };

  const addChallenge = () => {
    if (challenges.length >= 5) return;
    setChallenges((prev) => [...prev, { id: nanoid(), question: "", correctSortOrders: new Set() }]);
  };

  const removeChallenge = (id: string) => {
    if (challenges.length <= 1) return;
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  const updateQuestion = (id: string, question: string) => {
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, question } : c));
  };

  const toggleCorrectPhoto = (challengeId: string, sortOrder: number) => {
    setChallenges((prev) => prev.map((c) => {
      if (c.id !== challengeId) return c;
      const next = new Set(c.correctSortOrders);
      if (next.has(sortOrder)) next.delete(sortOrder); else next.add(sortOrder);
      return { ...c, correctSortOrders: next };
    }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.captchas.$post({
        json: {
          resultMessage: resultMessage.trim(),
          images: readyPhotos.map((p) => ({ key: p.key!, imageUrl: p.imageUrl!, sortOrder: p.sortOrder })),
          challenges: challenges.map((ch, i) => ({
            question: ch.question.trim(),
            sortOrder: i,
            correctImageSortOrders: Array.from(ch.correctSortOrders),
          })),
        },
      });
      if (!res.ok) {
        const data = await res.json() as { error: string };
        throw new Error(data.error || "Failed to create");
      }
      const data = await res.json();
      return (data as { id: string }).id;
    },
    onSuccess: (id) => navigate(`/success/${id}`),
    onError: (err: Error) => setError(err.message),
  });

  const handleGenerate = () => {
    setError(null);
    if (!resultMessage.trim()) { setError("Write what your friend will see after completing the CAPTCHA."); return; }
    createMutation.mutate();
  };

  const challengeSelectedIds = (challenge: Challenge): Set<string> => {
    const selected = new Set<string>();
    for (const sortOrder of challenge.correctSortOrders) {
      const photo = readyPhotos.find((p) => p.sortOrder === sortOrder);
      if (photo) selected.add(photo.id);
    }
    return selected;
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }}>
      {/* Top nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        padding: "0 24px",
        height: "56px",
        display: "flex", alignItems: "center", gap: "10px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => step === 1 ? navigate("/") : setStep((step - 1) as Step)}
          style={{
            background: "none", border: "none", cursor: "pointer", color: "#6b7280",
            padding: "6px", display: "flex", alignItems: "center", borderRadius: "6px",
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <FriendLogo size={22} />
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>FriendCAPTCHA</span>
        <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>Step {step} of 3</span>
      </nav>

      <div className="fade-in" style={{ maxWidth: "600px", margin: "0 auto", padding: "36px 20px 80px" }}>
        <div style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: "16px", padding: "32px 28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.7)",
        }}>
          <StepBar current={step} />

          {/* ── STEP 1: Photos ── */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#111827" }}>
                Create a prank CAPTCHA
              </h1>
              <p style={{ color: "#6b7280", margin: "0 0 32px", fontSize: "14px", lineHeight: 1.6 }}>
                Build something that looks exactly like a real CAPTCHA — but it's just for your friends.
              </p>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Photos</label>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>{photos.length}/16</span>
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 12px", lineHeight: 1.5 }}>
                  Upload 4–16 photos. Your friend will see these in the fake CAPTCHA grid.
                </p>

                {photos.length < 16 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: "2px dashed #d1d5db", borderRadius: "10px",
                      padding: photos.length > 0 ? "18px" : "40px 20px",
                      textAlign: "center", cursor: "pointer", background: "#fafafa",
                      marginBottom: photos.length > 0 ? "14px" : "0",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#f5f5f7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fafafa"; }}
                  >
                    {isUploading ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#6b7280", fontSize: "13px" }}>
                        <Spinner size={15} color="#000" />Uploading...
                      </div>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ margin: "0 auto 8px", display: "block" }}>
                          <path d="M14 4v14M8 10l6-6 6 6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 22h20" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                          {photos.length === 0 ? "Click or drag to upload photos" : "Add more photos"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>JPG, PNG, WEBP · Max 16 photos</div>
                      </>
                    )}
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileChange} />

                {photos.length > 0 && (
                  <PhotoGrid
                    photos={photos.map((p) => ({ id: p.id, previewUrl: p.previewUrl, uploading: p.uploading }))}
                    selectedIds={new Set()} onToggle={() => {}}
                    onRemove={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
                    cols={4}
                  />
                )}
              </div>

              {error && <ErrorBox message={error} />}
              <PrimaryBtn onClick={handleStep1Continue} disabled={isUploading} loading={isUploading}>
                {isUploading ? "Uploading..." : "Continue"}
              </PrimaryBtn>
            </div>
          )}

          {/* ── STEP 2: Challenges ── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#111827" }}>
                Write your challenges
              </h1>
              <p style={{ color: "#6b7280", margin: "0 0 28px", fontSize: "14px", lineHeight: 1.6 }}>
                These show up as the fake CAPTCHA prompts. Make them funny, confusing, or cruel.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {challenges.map((ch, idx) => (
                  <div key={ch.id} className="fade-in" style={{
                    background: "white", border: "1.5px solid #e5e7eb",
                    borderRadius: "10px", overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{
                      padding: "10px 16px", borderBottom: "1px solid #f3f4f6",
                      background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        Challenge {idx + 1}
                      </span>
                      {challenges.length > 1 && (
                        <button onClick={() => removeChallenge(ch.id)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#9ca3af", fontSize: "12px", fontWeight: 500,
                          padding: "2px 8px", borderRadius: "4px", transition: "color 0.1s",
                        }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                        >Remove</button>
                      )}
                    </div>
                    <div style={{ padding: "16px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "7px" }}>
                        Prompt (shown to your friend)
                      </label>
                      <input
                        type="text" value={ch.question}
                        onChange={(e) => updateQuestion(ch.id, e.target.value)}
                        placeholder={EXAMPLE_QUESTIONS[idx % EXAMPLE_QUESTIONS.length]}
                        maxLength={120}
                        style={{
                          width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "7px",
                          padding: "9px 12px", fontSize: "13px", color: "#111827",
                          background: "white", outline: "none",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          marginBottom: "14px",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "#000"; e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.08)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                          Mark "correct" photos
                        </label>
                        <span style={{ fontSize: "11px", fontWeight: 500, color: ch.correctSortOrders.size > 0 ? "#16a34a" : "#9ca3af" }}>
                          {ch.correctSortOrders.size > 0 ? `${ch.correctSortOrders.size} selected` : "Tap to select"}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 10px", lineHeight: 1.5 }}>
                        These are the "right answers" — but don't worry, the result is the same either way. It's a prank.
                      </p>
                      <PhotoGrid
                        photos={readyPhotos.map((p) => ({ id: p.id, previewUrl: p.previewUrl, uploading: false }))}
                        selectedIds={challengeSelectedIds(ch)}
                        onToggle={(photoId) => {
                          const photo = readyPhotos.find((p) => p.id === photoId);
                          if (photo) toggleCorrectPhoto(ch.id, photo.sortOrder);
                        }}
                        cols={5}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {challenges.length < 5 && (
                <button onClick={addChallenge} style={{
                  width: "100%", marginTop: "12px",
                  background: "white", border: "2px dashed #d1d5db",
                  borderRadius: "8px", padding: "12px",
                  fontSize: "13px", fontWeight: 600, color: "#6b7280",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; e.currentTarget.style.background = "#f5f5f7"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "white"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Add challenge ({challenges.length}/5)
                </button>
              )}

              {error && <ErrorBox message={error} />}
              <PrimaryBtn onClick={handleStep2Continue}>Continue</PrimaryBtn>
            </div>
          )}

          {/* ── STEP 3: Result message ── */}
          {step === 3 && (
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#111827" }}>
                What does your friend see?
              </h1>
              <p style={{ color: "#6b7280", margin: "0 0 8px", fontSize: "14px", lineHeight: 1.6 }}>
                After they click VERIFY, this message appears on the result screen. Make it feel official. Make it count.
              </p>

              {/* Preview of what it looks like */}
              <div style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: "8px", padding: "12px 14px", marginBottom: "20px",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Preview — what your friend sees
                </div>
                <div style={{
                  background: "#4a4a4a", borderRadius: "4px",
                  padding: "10px 12px",
                  fontSize: "13px", color: "white", lineHeight: 1.55,
                  minHeight: "40px",
                  fontStyle: resultMessage.trim() ? "normal" : "italic",
                  opacity: resultMessage.trim() ? 1 : 0.5,
                }}>
                  {resultMessage.trim() || "Your message will appear here..."}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "7px" }}>
                  Result message
                </label>
                <textarea
                  value={resultMessage}
                  onChange={(e) => setResultMessage(e.target.value)}
                  placeholder="Write what your friend will see after completing the CAPTCHA..."
                  maxLength={300}
                  rows={4}
                  style={{
                    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px",
                    padding: "10px 14px", fontSize: "13px", color: "#111827",
                    background: "white", outline: "none", resize: "vertical",
                    fontFamily: "inherit", lineHeight: 1.6,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#000"; e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.08)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px", textAlign: "right" }}>
                  {resultMessage.length}/300
                </div>
              </div>

              {/* Example messages */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Need inspiration?
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {RESULT_MESSAGE_EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => setResultMessage(ex)} style={{
                      background: "white", border: "1px solid #e5e7eb", borderRadius: "7px",
                      padding: "9px 12px", fontSize: "12px", color: "#374151",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      lineHeight: 1.5, transition: "all 0.12s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}
                    >
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>

              {error && <ErrorBox message={error} />}
              <PrimaryBtn onClick={handleGenerate} disabled={createMutation.isPending} loading={createMutation.isPending}>
                {createMutation.isPending ? "Generating your link..." : "Generate prank link"}
              </PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
