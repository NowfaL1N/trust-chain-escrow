"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/site-nav";
import { cn } from "@/lib/utils";
import { CountryIdentifierFields, CountryIdentifierData } from "@/components/country-identifier-fields";

function RegisterContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [errorMessage, setErrorMessage] = useState("");

  // Seller Company Fields
  const [companyDetails, setCompanyDetails] = useState({
    companyLegalName: "",
    cin: "",
    gstin: "",
    pan: "",
    businessAddress: "",
    country: "India",
    website: "",
    emailDomain: "",
    representativeName: "",
    representativeRole: "",
    phone: "",
  });

  // New country-based identifier fields
  const [countryIdentifiers, setCountryIdentifiers] = useState<CountryIdentifierData>({
    country: "India",
    lei: "",
    primaryIdentifier: "",
    secondaryIdentifier: "",
    identifierType: "India",
  });

  // Sync country selection between old and new fields
  const handleCountryIdentifierChange = (newData: CountryIdentifierData) => {
    setCountryIdentifiers(newData);
    setCompanyDetails(prev => ({
      ...prev,
      country: newData.country,
      // Update legacy fields for backward compatibility
      gstin: newData.primaryIdentifier,
      cin: newData.secondaryIdentifier,
    }));
  };

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const roleParam = searchParams.get("role") as "buyer" | "seller";
    if (emailParam) setEmail(emailParam);
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyDetails: {
            ...companyDetails,
            // Include new country-based identifier fields
            ...countryIdentifiers,
          },
        }),
      });

      let data: { token?: string; user?: { role?: string; email?: string }; error?: string };
      try {
        data = await res.json();
      } catch {
        setErrorMessage("Server error. Please try again.");
        return;
      }
      if (res.ok && data.token && data.user && (data.user.role === "buyer" || data.user.role === "seller")) {
        const dashboardPath = data.user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("escrow_demo_auth", JSON.stringify({ role: data.user!.role, email: data.user!.email ?? email }));
            window.localStorage.setItem("escrow_token", data.token);
            document.cookie = `escrow_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
        } catch {}
        window.location.replace(dashboardPath);
        return;
      }
      if (data.error === "User already exists") {
        const params = new URLSearchParams({ email: email.trim(), role });
        params.set("existing", "1");
        window.location.replace(`/login?${params.toString()}`);
        return;
      }
      setErrorMessage(data.error || "Registration failed");
    } catch {
      setErrorMessage("An error occurred during registration");
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-display">
      <div className="fixed inset-0 z-0 bg-pattern pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />

      <SiteNav showRegister={false} showLogin />

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-8 lg:p-12"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Create an account
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Join TrustChain to get started
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">
                  I am a
                </Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
                      role === "buyer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    )}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
                      role === "seller"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    )}
                  >
                    Seller
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              {(role === "buyer" || role === "seller") && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Company details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Legal Company Name</Label>
                      <Input
                        placeholder="Company Ltd"
                        value={companyDetails.companyLegalName}
                        onChange={(e) => setCompanyDetails({...companyDetails, companyLegalName: e.target.value})}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    {/* Dynamic Country-based Identifier Fields */}
                    <CountryIdentifierFields
                      data={countryIdentifiers}
                      onChange={handleCountryIdentifierChange}
                    />
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Business Address</Label>
                      <Input
                        placeholder="123 Business Park"
                        value={companyDetails.businessAddress}
                        onChange={(e) => setCompanyDetails({...companyDetails, businessAddress: e.target.value})}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Representative Name</Label>
                      <Input
                        placeholder="Authorized representative full name"
                        value={companyDetails.representativeName}
                        onChange={(e) => setCompanyDetails({...companyDetails, representativeName: e.target.value})}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Website</Label>
                        <Input
                          placeholder="www.company.com"
                          value={companyDetails.website}
                          onChange={(e) => setCompanyDetails({...companyDetails, website: e.target.value})}
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Phone</Label>
                        <Input
                          placeholder="+91..."
                          value={companyDetails.phone}
                          onChange={(e) => setCompanyDetails({...companyDetails, phone: e.target.value})}
                          className="h-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Confirm password
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg flex items-center justify-center gap-2 group text-base"
              >
                Create account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10 opacity-30 pointer-events-none" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
        Loading...
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
