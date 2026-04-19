"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EscrowLogo } from "./escrow-logo";
import { ThemeToggle } from "./theme-toggle";

type SiteNavProps = {
  showRegister?: boolean;
  showLogin?: boolean;
  dashboardRole?: "buyer" | "seller";
};

export function SiteNav({
  showRegister = true,
  showLogin = false,
  dashboardRole,
}: SiteNavProps) {
  return (
    <nav className="relative z-10 w-full px-6 py-6 lg:px-20 flex justify-between items-center border-b border-border bg-card/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EscrowLogo href="/" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-6 md:gap-8"
      >
        <ThemeToggle />
        <Link
          className="text-sm font-medium hover:text-primary transition-colors"
          href="/support"
        >
          Support
        </Link>
        {dashboardRole ? (
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href={dashboardRole === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
          >
            Dashboard
          </Link>
        ) : null}
        {showLogin && (
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="/"
          >
            Login
          </Link>
        )}
        {showRegister && (
          <Link
            className="px-5 py-2 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20"
            href="/register"
          >
            Register
          </Link>
        )}
      </motion.div>
    </nav>
  );
}
