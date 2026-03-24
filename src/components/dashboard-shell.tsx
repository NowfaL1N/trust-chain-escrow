"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  History,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { clearDemoAuth, setDemoAuth, type DemoAuth } from "@/lib/auth-demo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export type BreadcrumbItem = { label: string; href?: string };

type DashboardShellProps = {
  role: "buyer" | "seller";
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
};

export function DashboardShell({
  role,
  title,
  breadcrumbs,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState<DemoAuth | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; text: string; time: string; read: boolean }[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("escrow_token");
    const authStr = localStorage.getItem("escrow_demo_auth");

    if (!token) {
      router.replace(`/login?role=${role}`);
      return;
    }

    // Prefer stored auth; if missing, derive from JWT payload (role + email) so we never get stuck on Loading
    let data: DemoAuth | null = null;
    if (authStr) {
      try {
        const parsed = JSON.parse(authStr) as DemoAuth;
        if (parsed.role === role) data = parsed;
      } catch {
        // ignore
      }
    }
    if (!data) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? "{}"));
        if (payload.role === "buyer" || payload.role === "seller") {
          data = { role: payload.role, email: payload.email ?? "" };
          setDemoAuth(data);
        }
      } catch {
        // ignore
      }
    }
    if (data && data.role === role) {
      setAuth(data);
    } else if (data) {
      router.replace(data.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer");
    } else {
      router.replace(`/login?role=${role}`);
    }
  }, [role, router]);

  function handleLogout() {
    clearDemoAuth();
    router.push("/");
  }

  if (!mounted || !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const base = role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller";

  const navItems = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/transactions`, label: "Transactions", icon: ArrowLeftRight },
    { href: `${base}/contacts`, label: "Contacts", icon: Users },
    { href: `${base}/audit-log`, label: "Audit Log", icon: History },
  ];

  return (
    <div className="min-h-screen flex text-foreground font-display bg-background">
      <div className="fixed inset-0 z-0 bg-pattern pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 w-64 h-full border-r border-border flex flex-col bg-card">
        <div className="p-4 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trust-chain-logo-webpe.gif"
            alt="TrustChain Logo"
            className="h-14 w-[100px] object-contain"
          />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === base
                ? pathname === base
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "sidebar-active text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {role === "buyer" && (
          <div className="p-4 border-t border-border">
            <Link
              href={`${base}/new-transaction`}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Transaction
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="relative z-10 ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-foreground">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted-foreground">/</span>}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:ring-2 focus:ring-primary text-sm w-64 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* Notifications */}
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:bg-muted rounded-lg relative transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                </PopoverTrigger>
                
                <PopoverContent 
                  asChild 
                  align="end" 
                  sideOffset={8}
                  className="w-80 p-0 border-border"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card rounded-t-xl">
                      <h3 className="font-bold text-foreground">Notifications</h3>
                      <div className="flex gap-3">
                        {notifications.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                            className="text-xs text-primary hover:underline font-semibold"
                          >
                            Mark read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setNotifications([])}
                            className="text-xs text-red-500 hover:underline font-semibold"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto w-full bg-card">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))}
                            className={`p-4 border-b border-border hover:bg-muted/50 transition-colors flex gap-3 cursor-pointer ${n.read ? 'opacity-60' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                              <Bell className={`w-4 h-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                            </div>
                            <div>
                              <p className={`text-sm mb-1 leading-snug ${n.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                {n.text}
                              </p>
                              <span className="text-xs text-muted-foreground">{n.time}</span>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 ml-auto" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-muted/50 text-center border-t border-border rounded-b-xl">
                      <button type="button" className="text-xs font-semibold text-muted-foreground hover:text-primary">
                        View All Notifications
                      </button>
                    </div>
                  </motion.div>
                </PopoverContent>
              </Popover>

              {/* User Profile */}
              <div className="pl-4 border-l border-border">
                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer select-none rounded-lg p-1 pr-3 hover:bg-muted transition-colors">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-foreground leading-tight">
                          {auth.email.split("@")[0].replace(/[._]/g, " ") || "User"}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {role === "buyer" ? "Buyer" : "Seller"}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                        <span className="text-sm">
                          {(auth.email[0] || "U").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    asChild 
                    align="end" 
                    sideOffset={8}
                    className="w-56 p-2"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <div className="px-2 py-1.5 pb-3 border-b border-border mb-2 sm:hidden">
                        <p className="text-sm font-bold text-foreground truncate">
                          {auth.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {role} Account
                        </p>
                      </div>
                      
                      <DropdownMenuItem asChild className="cursor-pointer mb-1">
                        <Link href={`${base}/settings`} className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-foreground">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="my-1" />
                      
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-600 focus:text-red-600 focus:bg-red-50 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </DropdownMenuItem>
                    </motion.div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8 space-y-8 flex-1">{children}</div>

        {/* Footer */}
        <footer className="p-8 mt-auto border-t border-border text-muted-foreground text-xs flex justify-between">
          <p>© {new Date().getFullYear()} TrustChain Escrow Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/support" className="hover:text-primary transition-colors">
              Support
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
