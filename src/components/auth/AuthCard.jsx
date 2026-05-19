import { motion } from "framer-motion";
import { Globe, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AuthCard({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from?.pathname || "/dashboard";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login(form);
      }
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(authError.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const googleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(authError.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center px-4 py-14 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-surface mx-auto w-full max-w-md rounded-3xl p-6 md:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-electric/10 text-electric shadow-glow">
            <Zap fill="currentColor" size={22} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-electric">
              {isSignup ? "Create account" : "Welcome back"}
            </p>
            <h1 className="text-2xl font-black text-white">
              {isSignup ? "Start your AI physics cockpit." : "Continue your learning streak."}
            </h1>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-electric/20 bg-electric/10 p-3 text-xs font-bold text-slate-300">
          <ShieldCheck className="text-electric" size={16} />
          Secure Firebase Authentication with persistent login.
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <form className="grid gap-4" onSubmit={submit}>
          {isSignup && (
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Full name
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-electric"
                placeholder="Adith Kumar"
                required
              />
            </label>
          )}
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Email
            <input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-electric"
              placeholder="student@example.com"
              type="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Password
            <input
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-electric"
              placeholder="Password"
              type="password"
              minLength={6}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="premium-button mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-amber-300 px-5 py-3 font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={googleSubmit}
          disabled={loading}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-black text-white transition hover:border-electric hover:text-electric disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Globe size={18} />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignup ? "Already have an account?" : "New to Volt Sensei?"}{" "}
          <Link className="font-black text-electric" to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Login" : "Join free"}
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

export default AuthCard;
