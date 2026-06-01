import { useLocation } from "wouter";
import { FriendLogo } from "../components/ui/CaptchaCard";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        padding: "0 32px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <FriendLogo size={26} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "white", letterSpacing: "-0.01em", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            FriendCAPTCHA
          </span>
        </div>
        <button
          onClick={() => navigate("/create")}
          style={{
            background: "rgba(255,255,255,0.95)",
            color: "#6b7280",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
        >
          Get started
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 24px 96px",
        textAlign: "center",
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}>
        {/* Frosted glass card wrapping all hero content */}
        <div className="fade-in-up" style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "20px",
          padding: "48px 40px",
          maxWidth: "640px",
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "32px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
            letterSpacing: "0.01em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6b7280", display: "inline-block" }} />
            Friend Recognition
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: "0 0 20px",
            color: "#111827",
            maxWidth: "620px",
          }}>
            Send your friends a<br />
            <span style={{ color: "#1c1c1e" }}>fake CAPTCHA</span>
          </h1>

          <p style={{
            color: "#6b7280",
            fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
            lineHeight: 1.7,
            maxWidth: "440px",
            margin: "0 auto 40px",
          }}>
            Looks exactly like a real security check. Write funny prompts, upload your photos, and watch them try to pass it.
          </p>

          <button
            onClick={() => navigate("/create")}
            style={{
              background: "#000000",
              color: "white",
              border: "none",
              borderRadius: "980px",
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3a3a3c";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#000000";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Create your verification
          </button>

          {/* Mock CAPTCHA widget */}
          <div style={{
            marginTop: "40px",
            width: "100%",
            maxWidth: "360px",
            margin: "40px auto 0",
            background: "white",
            border: "2px solid #e5e7eb",
            borderRadius: "10px",
            padding: "18px 22px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "26px",
                height: "26px",
                border: "2px solid #d1d5db",
                borderRadius: "5px",
                background: "#f9fafb",
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>I know this person</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>FriendCAPTCHA · Protected</div>
              </div>
            </div>
            <FriendLogo size={32} />
          </div>

          {/* How it works */}
          <div style={{ marginTop: "40px", width: "100%" }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: "20px",
            }}>
              How it works
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}>
              {[
                { step: "01", title: "Upload your photos", desc: "Add 4–16 personal photos. The weirder, the better." },
                { step: "02", title: "Write funny prompts", desc: "\"Select all photos where I'm drinking water.\" Make it cruel." },
                { step: "03", title: "Set the punchline", desc: "Write what your friend sees at the end. Make it good." },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{
                  background: "rgba(249,250,251,0.8)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "18px",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    {step}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", color: "#111827" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #e5e7eb",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        color: "#9ca3af",
        fontSize: "12px",
        background: "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <FriendLogo size={14} />
          <span style={{ color: "#6b7280" }}>FriendCAPTCHA</span>
        </div>
        <span>·</span>
        <span>Not affiliated with Google, Cloudflare, or any real security company.</span>
      </footer>
    </div>
  );
}
