import { useState, useEffect } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────
const colors = {
  bg:       "#0e0f11",
  surface:  "#16181c",
  border:   "#2a2d35",
  borderHi: "#3d4251",
  text:     "#e8e9eb",
  muted:    "#7a7f8e",
  hint:     "#4a4f5e",
  teal:     "#1ec98a",
  tealDim:  "#0d8a5e",
  purple:   "#7c6ff7",
  amber:    "#f5a623",
  coral:    "#f26b4e",
  green:    "#3ecf8e",
};

const st = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  card: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: "32px 36px",
  },
  input: {
    width: "100%",
    background: "#1c1f26",
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: colors.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  label: { fontSize: 12, color: colors.muted, fontWeight: 500, letterSpacing: "0.04em", display: "block", marginBottom: 6 },
  btnPrimary: {
    width: "100%",
    background: `linear-gradient(135deg, ${colors.teal} 0%, #18b070 100%)`,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  btnOutline: {
    width: "100%",
    background: "transparent",
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  errBox: {
    background: "#2d1a1a",
    border: "1px solid #6b3030",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#f08080",
  },
  successBox: {
    background: "#0d2a1e",
    border: "1px solid #1e6b4a",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: colors.teal,
  },
};

// ─── Trust badge config ────────────────────────────────────────────────────
const BADGES = {
  "Elite Swapper":    { color: "#f5a623", bg: "rgba(245,166,35,0.12)", icon: "★" },
  "Top Trader":       { color: "#7c6ff7", bg: "rgba(124,111,247,0.12)", icon: "◆" },
  "Trusted Trader":   { color: "#1ec98a", bg: "rgba(30,201,138,0.12)", icon: "✓" },
  "Verified Swapper": { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: "✓" },
  "New Swapper":      { color: "#7a7f8e", bg: "rgba(122,127,142,0.12)", icon: "●" },
};

function TrustBadge({ badge }) {
  if (!badge || !BADGES[badge]) return null;
  const { color, bg, icon } = BADGES[badge];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg, color, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
    }}>
      <span>{icon}</span>{badge}
    </span>
  );
}

function StarRating({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: size, cursor: onChange ? "pointer" : "default",
            color: n <= (hovered || value) ? colors.amber : colors.hint,
            transition: "color 0.1s",
          }}
        >★</span>
      ))}
    </div>
  );
}

function Avatar({ name, src, size = 48 }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const hue = name ? name.charCodeAt(0) * 13 % 360 : 200;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},45%,30%)`, color: `hsl(${hue},70%,80%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── VIEWS ─────────────────────────────────────────────────────────────────

function LoginForm({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Please fill all fields.");
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (form.email === "demo@swap.com" && form.password === "password123") {
        onSuccess({
          _id: "u1", name: "Priya Menon", email: form.email,
          bio: "Sustainable fashion lover from Kerala. Swapping since 2023.",
          city: "Kochi", pincode: "682001",
          sizePreferences: { tops: "M", bottoms: "28", shoes: "7", dresses: "M" },
          isVerified: true, avgRating: 4.7, swapCount: 23, trustBadge: "Top Trader",
        });
      } else {
        setError("Invalid credentials. Try demo@swap.com / password123");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
      <div style={st.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>♻</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Welcome back</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: colors.muted }}>Sign in to your SwapMarket account</p>
        </div>

        {error && <div style={{ ...st.errBox, marginBottom: 18 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={st.label}>EMAIL</label>
          <input style={st.input} type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={st.label}>PASSWORD</label>
          <input style={st.input} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>

        <button style={{ ...st.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: 12, color: colors.muted }}>OR</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <button style={st.btnOutline} onClick={() => alert("Google OAuth — integrate @react-oauth/google")}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: colors.muted }}>
          Don't have an account?{" "}
          <span onClick={() => onSwitch("register")} style={{ color: colors.teal, cursor: "pointer", fontWeight: 600 }}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!form.name || !form.email || !form.password) return setError("All fields are required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    setTimeout(() => { setDone(true); setLoading(false); }, 900);
  };

  if (done) return (
    <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
      <div style={{ ...st.card, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Check your inbox</h2>
        <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
          We sent a verification link to <strong style={{ color: colors.text }}>{form.email}</strong>.
          Click it to activate your account.
        </p>
        <button style={{ ...st.btnPrimary, marginTop: 24 }} onClick={() => onSwitch("login")}>Back to sign in</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
      <div style={st.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>♻</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Join SwapMarket</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: colors.muted }}>Swap clothes, reduce waste</p>
        </div>

        {error && <div style={{ ...st.errBox, marginBottom: 18 }}>{error}</div>}

        {[
          { key: "name", label: "FULL NAME", type: "text", ph: "Priya Menon" },
          { key: "email", label: "EMAIL", type: "email", ph: "you@example.com" },
          { key: "password", label: "PASSWORD", type: "password", ph: "Min 8 characters" },
          { key: "confirm", label: "CONFIRM PASSWORD", type: "password", ph: "Repeat password" },
        ].map(({ key, label, type, ph }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={st.label}>{label}</label>
            <input style={st.input} type={type} placeholder={ph}
              value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            {["weak","fair","strong","strong"].map((s, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: form.password.length > i * 3
                  ? (i < 1 ? colors.coral : i < 2 ? colors.amber : colors.teal)
                  : colors.border
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: colors.hint, margin: 0 }}>
            {form.password.length === 0 ? "Enter a password" : form.password.length < 4 ? "Weak" : form.password.length < 8 ? "Fair" : "Strong"}
          </p>
        </div>

        <button style={{ ...st.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: colors.muted }}>
          Already have an account?{" "}
          <span onClick={() => onSwitch("login")} style={{ color: colors.teal, cursor: "pointer", fontWeight: 600 }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

// ─── Profile Edit ─────────────────────────────────────────────────────────

function ProfileEdit({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:  user.name || "",
    bio:   user.bio || "",
    city:  user.city || "",
    pincode: user.pincode || "",
    tops:    user.sizePreferences?.tops || "",
    bottoms: user.sizePreferences?.bottoms || "",
    shoes:   user.sizePreferences?.shoes || "",
    dresses: user.sizePreferences?.dresses || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...user,
        name: form.name, bio: form.bio, city: form.city, pincode: form.pincode,
        sizePreferences: { tops: form.tops, bottoms: form.bottoms, shoes: form.shoes, dresses: form.dresses },
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 700);
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Edit profile</h2>
      </div>

      <div style={st.card}>
        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${colors.border}` }}>
          <Avatar name={form.name} size={64} />
          <div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>{form.name || "Your name"}</p>
            <button style={{ fontSize: 12, color: colors.teal, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Upload photo
            </button>
          </div>
        </div>

        {/* Basic info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={st.label}>FULL NAME</label>
            <input style={st.input} value={form.name} onChange={set("name")} placeholder="Your name" />
          </div>
          <div>
            <label style={st.label}>CITY</label>
            <input style={st.input} value={form.city} onChange={set("city")} placeholder="Kochi" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={st.label}>PINCODE</label>
          <input style={{ ...st.input, maxWidth: 160 }} value={form.pincode} onChange={set("pincode")} placeholder="682001" />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={st.label}>BIO</label>
          <textarea style={{ ...st.input, height: 80, resize: "vertical" }}
            value={form.bio} onChange={set("bio")} placeholder="Tell other swappers about yourself…" maxLength={300} />
          <p style={{ fontSize: 11, color: colors.hint, margin: "4px 0 0", textAlign: "right" }}>{form.bio.length}/300</p>
        </div>

        {/* Size preferences */}
        <div style={{ paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>Size preferences</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: colors.muted }}>Used to show you relevant swap suggestions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { key: "tops", label: "TOPS" },
              { key: "bottoms", label: "BOTTOMS (waist)" },
              { key: "dresses", label: "DRESSES" },
              { key: "shoes", label: "SHOES (EU size)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={st.label}>{label}</label>
                {key === "shoes" ? (
                  <input style={st.input} value={form[key]} onChange={set(key)} placeholder="38" />
                ) : (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {sizes.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, [key]: s }))}
                        style={{
                          padding: "5px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500,
                          background: form[key] === s ? colors.teal : "transparent",
                          color: form[key] === s ? "#fff" : colors.muted,
                          border: `1px solid ${form[key] === s ? colors.teal : colors.border}`,
                          transition: "all 0.15s",
                        }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={onCancel} style={{ ...st.btnOutline, flex: 1 }}>Cancel</button>
          <button onClick={handleSave} style={{ ...st.btnPrimary, flex: 2, opacity: saving ? 0.7 : 1 }} disabled={saving}>
            {saving ? "Saving…" : success ? "✓ Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  return (
    <div style={{ padding: "16px 0", borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar name={review.reviewerName} size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{review.reviewerName}</p>
          <p style={{ margin: 0, fontSize: 11, color: colors.muted }}>{review.date}</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StarRating value={review.rating} size={14} />
        </div>
      </div>
      {review.comment && <p style={{ margin: 0, fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>{review.comment}</p>}
    </div>
  );
}

// ─── Submit Review Modal ──────────────────────────────────────────────────

function ReviewModal({ targetName, onSubmit, onClose }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [error,   setError]   = useState("");

  const submit = () => {
    if (!rating) return setError("Please select a star rating.");
    onSubmit({ rating, comment });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ ...st.card, width: "100%", maxWidth: 420 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Rate your swap</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: colors.muted }}>How was your experience swapping with <strong style={{ color: colors.text }}>{targetName}</strong>?</p>

        {error && <div style={{ ...st.errBox, marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 20 }}>
          <label style={st.label}>RATING</label>
          <StarRating value={rating} onChange={setRating} size={36} />
          <p style={{ margin: "6px 0 0", fontSize: 12, color: colors.muted }}>
            {["", "Poor", "Fair", "Good", "Very good", "Excellent!"][rating] || ""}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={st.label}>REVIEW (optional)</label>
          <textarea style={{ ...st.input, height: 90, resize: "none" }}
            placeholder="Share what went well, or any tips for other swappers…"
            value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...st.btnOutline, flex: 1 }} onClick={onClose}>Cancel</button>
          <button style={{ ...st.btnPrimary, flex: 2 }} onClick={submit}>Submit review</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────

const DEMO_REVIEWS = [
  { reviewerName: "Meera S.", date: "2 days ago",    rating: 5, comment: "Super smooth swap! Clothes were exactly as described. Would swap again." },
  { reviewerName: "Arjun K.", date: "1 week ago",    rating: 5, comment: "Very reliable, fast communication, item was in great condition." },
  { reviewerName: "Nadia M.", date: "2 weeks ago",   rating: 4, comment: "Good experience overall. Slight delay but communicated well." },
  { reviewerName: "Rohan T.", date: "1 month ago",   rating: 5, comment: "Priya is amazing! Perfect swap, very honest about item condition." },
];

function ProfilePage({ user, onEdit, onLogout }) {
  const [reviews,     setReviews]     = useState(DEMO_REVIEWS);
  const [showReview,  setShowReview]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const avgRating = user.avgRating || (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  const handleReview = ({ rating, comment }) => {
    setReviews(prev => [{ reviewerName: "You", date: "Just now", rating, comment }, ...prev]);
    setShowReview(false);
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      {showReview && <ReviewModal targetName={user.name} onSubmit={handleReview} onClose={() => setShowReview(false)} />}

      {/* Header card */}
      <div style={{ ...st.card, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Avatar name={user.name} src={user.avatar} size={72} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{user.name}</h2>
              {user.isVerified && (
                <span style={{ fontSize: 12, color: colors.teal, background: "rgba(30,201,138,0.1)", border: `1px solid rgba(30,201,138,0.25)`, borderRadius: 20, padding: "2px 8px" }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <TrustBadge badge={user.trustBadge} />
            {user.bio && <p style={{ margin: "10px 0 0", fontSize: 14, color: colors.muted, lineHeight: 1.6 }}>{user.bio}</p>}
            {user.city && (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.hint }}>
                📍 {user.city}{user.pincode ? ` · ${user.pincode}` : ""}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onEdit} style={{ ...st.btnOutline, width: "auto", padding: "8px 16px", fontSize: 13 }}>Edit profile</button>
            <button onClick={onLogout} style={{ ...st.btnOutline, width: "auto", padding: "8px 14px", fontSize: 13, color: colors.muted }}>Sign out</button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 0, marginTop: 24, borderTop: `1px solid ${colors.border}`, paddingTop: 20 }}>
          {[
            { label: "Swaps", value: user.swapCount },
            { label: "Rating", value: `${avgRating} ★` },
            { label: "Reviews", value: reviews.length },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              flex: 1, textAlign: "center",
              borderRight: i < 2 ? `1px solid ${colors.border}` : "none",
            }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>{value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.muted }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Size preferences */}
      {user.sizePreferences && (
        <div style={{ ...st.card, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600 }}>Size preferences</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(user.sizePreferences).map(([k, v]) => v && (
              <div key={k} style={{
                background: "#1c1f26", border: `1px solid ${colors.border}`,
                borderRadius: 8, padding: "6px 14px",
              }}>
                <span style={{ fontSize: 11, color: colors.hint, textTransform: "capitalize" }}>{k} </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div style={st.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Reviews</h3>
          {!submitted && (
            <button onClick={() => setShowReview(true)} style={{
              background: "transparent", border: `1px solid ${colors.teal}`,
              color: colors.teal, borderRadius: 8, padding: "6px 14px",
              fontSize: 13, cursor: "pointer", fontWeight: 500,
            }}>+ Add review</button>
          )}
        </div>

        {submitted && <div style={{ ...st.successBox, marginBottom: 16 }}>✓ Your review was submitted!</div>}

        {/* Rating distribution */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", marginBottom: 16, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 700, lineHeight: 1, color: colors.text }}>{avgRating}</p>
            <StarRating value={Math.round(avgRating)} size={16} />
            <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.muted }}>{reviews.length} reviews</p>
          </div>
          <div style={{ flex: 1 }}>
            {ratingDist.map(({ n, count }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: colors.muted, minWidth: 12 }}>{n}</span>
                <span style={{ fontSize: 11, color: colors.amber }}>★</span>
                <div style={{ flex: 1, height: 6, background: colors.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / reviews.length) * 100}%`, background: colors.amber, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 12, color: colors.hint, minWidth: 16, textAlign: "right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
      </div>
    </div>
  );
}

// ─── BADGE PROGRESSION PANEL ──────────────────────────────────────────────

function BadgeProgression() {
  const levels = [
    { badge: "New Swapper",      swaps: 1,  rating: 0,   desc: "Complete your first swap" },
    { badge: "Verified Swapper", swaps: 3,  rating: 3.5, desc: "3 swaps, avg ≥ 3.5 ★" },
    { badge: "Trusted Trader",   swaps: 10, rating: 4.0, desc: "10 swaps, avg ≥ 4.0 ★" },
    { badge: "Top Trader",       swaps: 20, rating: 4.5, desc: "20 swaps, avg ≥ 4.5 ★" },
    { badge: "Elite Swapper",    swaps: 50, rating: 4.8, desc: "50 swaps, avg ≥ 4.8 ★" },
  ];
  return (
    <div style={{ ...st.card, maxWidth: 680, margin: "0 auto 20px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>Trust badge progression</h3>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {levels.map((l, i) => {
          const cfg = BADGES[l.badge];
          return (
            <div key={l.badge} style={{
              flex: "0 0 auto", minWidth: 110, padding: "12px 14px",
              background: "#1c1f26", border: `1px solid ${colors.border}`,
              borderRadius: 12, textAlign: "center",
            }}>
              <div style={{ fontSize: 18, marginBottom: 6, color: cfg.color }}>{cfg.icon}</div>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: cfg.color }}>{l.badge}</p>
              <p style={{ margin: 0, fontSize: 11, color: colors.hint, lineHeight: 1.5 }}>{l.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────

export default function SwapMarketAuth() {
  const [view,    setView]    = useState("login");  // login | register | profile | edit
  const [user,    setUser]    = useState(null);

  const handleLoginSuccess = (u) => { setUser(u); setView("profile"); };
  const handleSaveProfile  = (u) => { setUser(u); setView("profile"); };
  const handleLogout       = () => { setUser(null); setView("login"); };

  return (
    <div style={st.page}>
      {/* Topbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: `1px solid ${colors.border}`,
        background: colors.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>♻</span>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>SwapMarket</span>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrustBadge badge={user.trustBadge} />
            <Avatar name={user.name} size={32} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "32px 16px" }}>
        {/* Nav tabs (demo only) */}
        {!user && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 32 }}>
            {["login", "register"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500,
                background: view === v ? colors.teal : "transparent",
                color: view === v ? "#fff" : colors.muted,
                border: `1px solid ${view === v ? colors.teal : colors.border}`,
              }}>
                {v === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>
        )}

        {view === "login"    && <LoginForm    onSwitch={setView} onSuccess={handleLoginSuccess} />}
        {view === "register" && <RegisterForm onSwitch={setView} />}
        {view === "profile"  && user && (
          <>
            <BadgeProgression />
            <ProfilePage user={user} onEdit={() => setView("edit")} onLogout={handleLogout} />
          </>
        )}
        {view === "edit" && user && (
          <ProfileEdit user={user} onSave={handleSaveProfile} onCancel={() => setView("profile")} />
        )}
      </div>
    </div>
  );
}
