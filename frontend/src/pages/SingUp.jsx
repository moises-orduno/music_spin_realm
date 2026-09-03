import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Users,
  Disc3,
  Star,
} from "lucide-react";
import { useState } from "react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation / API call
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">

      <div className="w-full max-w-[1100px] min-h-[700px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--panel)] shadow-2xl flex">

        {/* ===================================================== */}
        {/* LEFT SIDE */}
        {/* ===================================================== */}

        <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden">

          {/* Background image */}
          <img
            src="/images/signup-vinyl.jpg"
            alt="Vinyl collection"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/65" />

          {/* Purple glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-black/60" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between w-full p-10">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-2">
                <Disc3
                  size={22}
                  className="text-[var(--accent)]"
                />

                <span className="font-serif text-[22px] text-white">
                  Vinyl
                </span>
              </div>
            </div>

            {/* Main message */}
            <div className="max-w-[390px]">

              <h1 className="font-serif text-[42px] leading-[1.05] text-white">
                Your music.
                <br />
                Your collection.
                <br />
                <span className="text-[var(--accent)]">
                  Your community.
                </span>
              </h1>

              <p className="mt-5 text-[14px] leading-6 text-white/65 max-w-[340px]">
                Join a community of vinyl lovers.
                Discover, collect, and share
                the music you love.
              </p>

              {/* Features */}
              <div className="flex items-start gap-10 mt-10">

                <Feature
                  icon={Users}
                  label="Connect"
                  description="with collectors"
                />

                <Feature
                  icon={Disc3}
                  label="Discover"
                  description="amazing music"
                />

                <Feature
                  icon={Star}
                  label="Share"
                  description="your passion"
                />

              </div>
            </div>

            <div />
          </div>
        </div>

        {/* ===================================================== */}
        {/* RIGHT SIDE */}
        {/* ===================================================== */}

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">

          <div className="w-full max-w-[480px]">

            {/* Header */}
            <div className="mb-8">

              <h2 className="font-serif text-[36px] leading-tight text-[var(--text)]">
                Create your account
              </h2>

              <p className="mt-3 text-[14px] leading-6 text-[var(--text-muted)]">
                Join a community of people who love
                collecting, discovering, and talking about music.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <Label>Email address</Label>

                <Input
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Username */}
              <div>
                <Label>Username</Label>

                <Input
                  icon={User}
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    updateField("username", e.target.value)
                  }
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>

                <div className="relative">

                  <Lock
                    size={17}
                    strokeWidth={1.7}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      updateField("password", e.target.value)
                    }
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg pl-11 pr-12 py-3.5 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

                {/* Password strength */}
                {form.password && (
                  <div className="mt-2">

                    <div className="flex gap-1">
                      <div className="h-1 flex-1 rounded-full bg-[var(--accent)]" />
                      <div className="h-1 flex-1 rounded-full bg-[var(--border-2)]" />
                      <div className="h-1 flex-1 rounded-full bg-[var(--border-2)]" />
                    </div>

                    <span className="text-[10.5px] text-[var(--text-muted)] mt-1 block">
                      Password strength
                    </span>

                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Label>Confirm password</Label>

                <div className="relative">

                  <Lock
                    size={17}
                    strokeWidth={1.7}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg pl-11 pr-12 py-3.5 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">

                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) =>
                    updateField("terms", e.target.checked)
                  }
                  className="mt-0.5 w-4 h-4 rounded border-[var(--border-2)] accent-[var(--accent)]"
                />

                <span className="text-[12px] leading-5 text-[var(--text-muted)]">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-[var(--accent)] hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-[var(--accent)] hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>

              </label>

              {/* Submit */}
              <button
                type="submit"
                className="btn-accent w-full rounded-xl py-3.5 text-[14px] font-semibold transition hover:-translate-y-0.5"
              >
                Create account
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">

              <div className="flex-1 h-px bg-[var(--border)]" />

              <span className="text-[11px] text-[var(--text-dim)]">
                or continue with
              </span>

              <div className="flex-1 h-px bg-[var(--border)]" />

            </div>

            {/* Social login */}
            <div className="space-y-3">

              <button
                type="button"
                className="w-full rounded-lg border border-[var(--border-2)] py-3 text-[13px] font-medium flex items-center justify-center gap-3 text-[var(--text)] hover:bg-[var(--panel-2)] transition"
              >
                <span className="font-bold text-[16px]">G</span>
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full rounded-lg border border-[var(--border-2)] py-3 text-[13px] font-medium flex items-center justify-center gap-3 text-[var(--text)] hover:bg-[var(--panel-2)] transition"
              >
                <span className="text-[16px]">●</span>
                Continue with Apple
              </button>

            </div>

            {/* Login */}
            <p className="text-center text-[12px] text-[var(--text-muted)] mt-7">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[var(--accent)] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}


/* ============================================================= */
/* COMPONENTS */
/* ============================================================= */

function Label({ children }) {
  return (
    <label className="block text-[12.5px] font-medium text-[var(--text)] mb-2">
      {children}
    </label>
  );
}


function Input({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="relative">

      <Icon
        size={17}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
      />

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg pl-11 pr-4 py-3.5 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
      />

    </div>
  );
}


function Feature({ icon: Icon, label, description }) {
  return (
    <div className="flex flex-col items-center text-center">

      <Icon
        size={22}
        strokeWidth={1.5}
        className="text-white/80 mb-2"
      />

      <span className="text-[12px] text-white font-medium">
        {label}
      </span>

      <span className="text-[10px] text-white/50 mt-0.5">
        {description}
      </span>

    </div>
  );
}