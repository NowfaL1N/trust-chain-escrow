"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role = (roleParam === "seller" ? "seller" : roleParam === "buyer" ? "buyer" : null);

  // If no role in URL, redirect to role selection so the chosen role is always in the URL
  useEffect(() => {
    if (role === null) {
      router.replace("/");
    }
  }, [role, router]);

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
        Redirecting to choose role...
      </div>
    );
  }

  const emailParam = searchParams.get("email") ?? "";
  const showExistingMessage = searchParams.get("existing") === "1";
  return <LoginForm role={role} initialEmail={emailParam} showExistingMessage={showExistingMessage} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white text-slate-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
