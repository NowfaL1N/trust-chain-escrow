"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/site-nav";
import { setDemoAuth } from "@/lib/auth-demo";

export type LoginRole = "buyer" | "seller";

type LoginFormProps = { role?: LoginRole; initialEmail?: string; showExistingMessage?: boolean };

export function LoginForm({ role = "buyer", initialEmail = "", showExistingMessage = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setShowError(true);
      setErrorMessage(!trimmedEmail ? "Please enter your email." : "Please enter your password.");
      return;
    }
    setShowError(false);
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      let data: { token?: string; user?: { role?: string; email?: string }; error?: string; message?: string };
      try {
        data = await res.json();
      } catch {
        setIsSubmitting(false);
        setShowError(true);
        setErrorMessage("Server error. Please try again.");
        return;
      }

      if (res.ok && data.token && data.user && (data.user.role === "buyer" || data.user.role === "seller")) {
        const dashboardPath = data.user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
        try {
          setDemoAuth({ role: data.user.role, email: data.user.email ?? trimmedEmail });
          if (typeof localStorage !== "undefined") localStorage.setItem("escrow_token", data.token!);
          document.cookie = `escrow_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        } catch {
          // still redirect
        }
        window.location.replace(dashboardPath);
        return;
      }

      if (data.error === "USER_NOT_FOUND") {
        window.location.replace(`/register?email=${encodeURIComponent(trimmedEmail)}&role=${role}`);
        return;
      }

      setIsSubmitting(false);
      setShowError(true);
      if (res.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else if (res.status >= 500) {
        setErrorMessage("Server error. Check that the database is running.");
      } else {
        setErrorMessage(data.message || data.error || "Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setIsSubmitting(false);
      setShowError(true);
      setErrorMessage("Network or server error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-display">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-pattern pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />

      <SiteNav showRegister showLogin={false} />

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-8 lg:p-12"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {role === "seller"
                  ? "Sign in to your Seller portal"
                  : "Secure access to your TrustChain Escrow Portal"}
              </p>
              {showExistingMessage && (
                <p className="text-sm text-primary font-medium mt-2">
                  Account already exists. Sign in to continue to your dashboard.
                </p>
              )}
              <Link
                href="/"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Not a {role}? Choose role
              </Link>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Password
                  </Label>
                  <Link
                    className="text-xs font-bold text-primary hover:underline"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (showError) setShowError(false);
                    }}
                    className={cn(
                      "h-14 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:border-primary outline-none transition-all",
                      showError
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {showError && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errorMessage}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <Checkbox id="remember" className="rounded border-slate-300 dark:border-slate-700" />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-600 dark:text-slate-400 select-none font-normal cursor-pointer"
                >
                  Remember this device
                </Label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group text-base disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in…" : "Enter Portal"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                New to the platform?{" "}
                <Link
                  className="text-primary font-bold hover:underline ml-1"
                  href={`/register?role=${role}`}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-500 font-medium"
          >
            <Link
              href="/privacy-policy"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </Link>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10 opacity-30 pointer-events-none" />
    </div>
  );
}
