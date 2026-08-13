import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { StarField } from "./StarField";
import { signIn, signUp } from "@/auth";

export function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "signup" && name.trim().length < 2) return setError("Please enter your name.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      if (mode === "signup") await signUp(name, email, password);
      else await signIn(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <StarField />
      <motion.div className="relative z-10 w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌙</div>
          <h1 className="heading-xl text-periwinkle glow-soft">Luna</h1>
          <p className="body-sm text-lavender/70 mt-1">Your music, your little universe.</p>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <div className="flex gap-2 p-1 rounded-2xl bg-black/10 mb-6">
            <button onClick={() => { setMode("signin"); setError(""); }} className={`flex-1 py-2 rounded-xl text-sm ${mode === "signin" ? "bg-white/10 text-white" : "text-lavender"}`}>Sign In</button>
            <button onClick={() => { setMode("signup"); setError(""); }} className={`flex-1 py-2 rounded-xl text-sm ${mode === "signup" ? "bg-white/10 text-white" : "text-lavender"}`}>Create Account</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && <div className="relative"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-lavender" /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl bg-white/5 border border-white/10 px-10 py-3 text-white outline-none" /></div>}
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-lavender" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl bg-white/5 border border-white/10 px-10 py-3 text-white outline-none" /></div>
            <div className="relative"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-lavender" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-2xl bg-white/5 border border-white/10 px-10 pr-11 py-3 text-white outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lavender">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            {error && <p className="text-sm text-soft-pink">{error}</p>}
            <button disabled={busy} className="w-full py-3 rounded-2xl bg-violet-twilight text-white font-semibold disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Enter Luna" : "Create Account"}</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
