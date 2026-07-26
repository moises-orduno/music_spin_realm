import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Heart, Check, AudioLines } from "lucide-react";
import { login } from "../services/authService";

// Featured list cards for the left promo
const FEATURED_LISTS = [
  { title: "Sci-Fi Movies", author: "Alex", cover: "linear-gradient(160deg, #1a2540 0%, #0a0f20 100%)", likes: "612", rotate: -8, offsetY: 40 },
  { title: "90s Hip Hop Albums", author: "Maria", cover: "linear-gradient(160deg, #6a2a2a 0%, #2a0a05 100%)", likes: "2.4K", rotate: 2, offsetY: 0, big: true },
  { title: "National Parks", author: "James", cover: "linear-gradient(160deg, #2a4a5a 0%, #0a2030 100%)", likes: "1.1K", rotate: 8, offsetY: 30 },
  { title: "Pizza Places", author: "Chris", cover: "linear-gradient(160deg, #b8621f 0%, #3a1a05 100%)", likes: "432", rotate: -5, offsetY: 100 },
  { title: "Animated Movies", author: "Sarah", cover: "linear-gradient(160deg, #4a6a3a 0%, #1a2a15 100%)", likes: "1.8K", rotate: 3, offsetY: 90 },
  { title: "Video Games", author: "Daniel", cover: "linear-gradient(160deg, #8a3a5a 0%, #2a0a15 100%)", likes: "952", rotate: 10, offsetY: 110 },
];

function SocialButton({ children, testid }) {
  return (
    <button
      data-testid={testid}
      className="flex-1 h-12 rounded-xl border border-[var(--border-2)] bg-[var(--panel)] flex items-center justify-center hover:border-[var(--accent)]/40 hover:bg-[var(--panel-2)] transition"
    >
      {children}
    </button>
  );
}

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const showLoginError = (message) => {
    setLoginError(message);

    setTimeout(() => {
      setLoginError("");
    }, 5000);
  };

  const location = useLocation();

  const message = location.state?.message;

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    }

    if (!pw.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const data = await login(email, pw);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirectTo = location.state?.redirectTo || "/";
      navigate(redirectTo);
    } catch (err) {
      showLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg)]" data-testid="login-page">
      {/* Left promo */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.20) 0%, transparent 60%)" }} />

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 relative z-10" data-testid="brand-link">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
            <AudioLines size={22} className="text-white" />
          </div>
          <span className="font-serif text-[26px] leading-none tracking-tight">SpinRealm</span>
        </Link>

        {/* Headline */}
        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-[54px] leading-[1.05] font-normal mb-6">
            <span className="block">Discover.</span>
            <span
              className="block"
              style={{ background: "linear-gradient(90deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Rank.
            </span>
            <span
              className="block"
              style={{ background: "linear-gradient(90deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Share.
            </span>
          </h1>
          <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-sm">
            Create and explore the best top lists on everything.
          </p>
        </div>

        {/* Floating list cards */}
        <div className="absolute left-0 right-0 bottom-16 flex items-end justify-center gap-3 pointer-events-none" style={{ perspective: "1000px" }}>
          {FEATURED_LISTS.map((c, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden shadow-2xl shrink-0 relative"
              style={{
                width: c.big ? 190 : 150,
                height: c.big ? 280 : 220,
                background: c.cover,
                transform: `rotate(${c.rotate}deg) translateY(${c.offsetY}px)`,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.5)]" />
              <div className="absolute top-3 left-3 right-3">
                <div className="text-[10px] tracking-wider text-white/70 uppercase mb-1">Top 10</div>
                <div className="font-serif text-white text-[15px] leading-tight">{c.title}</div>
                <div className="text-[10.5px] text-white/60 mt-1">by {c.author}</div>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/85 text-[11px]">
                <Heart size={11} fill="currentColor" /> {c.likes}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3" data-testid="social-proof">
          <div className="flex -space-x-2">
            {["#c2a876", "#6b3fa0", "#e85a6f", "#c04fa0"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg)]" style={{ background: `linear-gradient(135deg, ${c}, #1a1612)` }} />
            ))}
          </div>
          <div className="text-[12.5px] text-[var(--text-muted)] leading-snug">
            Join thousands of list makers<br />already sharing their top picks.
          </div>
        </div>
      </div>
     
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10" data-testid="brand-link-mobile">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <AudioLines size={18} className="text-white" />
            </div>
            <span className="font-serif text-[22px] leading-none">SpinRealm</span>
          </Link>
  {message && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
              {message}
            </div>
          )}
          <h2 className="font-serif text-[34px] sm:text-[38px] leading-none mb-2 text-center" data-testid="login-title">Welcome back</h2>
          <p className="text-[13px] text-[var(--text-muted)] text-center mb-10">Log in to your SpinRealm account</p>
        
          <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
            {/* Email/Username */}
            <div>
              <label className="block text-[12.5px] font-medium mb-2">Email or Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" strokeWidth={1.8} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }
                  }}
                  placeholder="Enter your email or username"
                  data-testid="email-input"
                  className={`w-full bg-[var(--panel)] rounded-xl pl-11 pr-4 py-3.5 text-[13.5px]
                      placeholder:text-[var(--text-dim)]
                      focus:outline-none transition
                      ${errors.email
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-[var(--border)] focus:border-[var(--accent)]/50"
                    }`}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12.5px] font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" strokeWidth={1.8} />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  data-testid="password-input"
                  className={`w-full bg-[var(--panel)] rounded-xl pl-11 pr-4 py-3.5 text-[13.5px]
                      placeholder:text-[var(--text-dim)]
                      focus:outline-none transition
                      ${errors.password
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-[var(--border)] focus:border-[var(--accent)]/50"
                    }`}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)]"
                  data-testid="toggle-password"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                data-testid="remember-toggle"
                className="flex items-center gap-2 text-[12.5px] text-[var(--text)]"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center transition ${remember ? "bg-[var(--accent)] border border-[var(--accent)]" : "border border-[var(--border-2)]"
                    }`}
                >
                  {remember && <Check size={11} className="text-white" strokeWidth={3} />}
                </span>
                Remember me
              </button>
              {loginError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {loginError}
                </div>
              )}
              <Link to="/forgot" className="text-[12.5px] text-[var(--accent-2)] hover:underline" data-testid="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Log in button */}
            <button
              type="submit"
              data-testid="submit-btn"
              disabled={loading}
              className="w-full h-13 py-3.5 rounded-xl font-semibold text-[14px] text-white transition hover:opacity-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                boxShadow: "0 10px 30px rgba(139,92,246,0.35)"
              }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11.5px] text-[var(--text-muted)]">or continue with</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <SocialButton testid="social-google">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            </SocialButton>
            <SocialButton testid="social-apple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" /></svg>
            </SocialButton>
            <SocialButton testid="social-discord">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
            </SocialButton>
          </div>

          {/* Sign up */}
          <p className="text-center text-[13px] text-[var(--text-muted)] mt-8">
            Don&apos;t have an account? <Link to="/signup" className="text-[var(--accent-2)] hover:underline font-medium" data-testid="signup-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
