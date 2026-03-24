"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { User, Bell, Lock, Shield, Mail, Smartphone, Globe } from "lucide-react";

type SettingsViewProps = {
  role: "buyer" | "seller";
};

export function SettingsView({ role }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");
  
  // States for Notifications Tab
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  
  // Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => setIsSavingProfile(false), 1000);
  };

  const handleSaveNotifications = () => {
    setIsSavingNotifications(true);
    setTimeout(() => setIsSavingNotifications(false), 1000);
  };

  return (
    <DashboardShell
      role={role}
      title="Account Settings"
      breadcrumbs={[
        { href: `/dashboard/${role}`, label: `${role === "buyer" ? "Buyer" : "Seller"} Home` },
        { label: "Settings" }
      ]}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile" ? "bg-primary text-white" : "hover:bg-slate-100 text-slate-600 dark:text-slate-400"
            }`}
          >
            <User className="w-4 h-4" /> User Profile
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "notifications" ? "bg-primary text-white" : "hover:bg-slate-100 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "security" ? "bg-primary text-white" : "hover:bg-slate-100 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your account details and public profile.</p>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder={`${role}@example.com`} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Acme Corp" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage how you receive alerts and updates.</p>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              
              <div className="space-y-4">
                {[
                  { id: "email", title: "Email Notifications", desc: "Receive daily transaction summaries via email.", icon: Mail },
                  { id: "push", title: "Push Notifications", desc: "Get real-time updates in your browser.", icon: Bell },
                  { id: "sms", title: "SMS Alerts", desc: "Urgent alerts sent to your phone number.", icon: Smartphone }
                ].map((item) => {
                  const isChecked = notifications[item.id as keyof typeof notifications];
                  return (
                    <label 
                      key={item.id} 
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${isChecked ? 'border-primary/50 bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isChecked}
                        onChange={() => toggleNotification(item.id as keyof typeof notifications)}
                      />
                      <div className={`mt-1 flex items-center justify-center shrink-0 w-5 h-5 rounded border transition-colors ${isChecked ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}>
                        {isChecked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-slate-500" /> {item.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifications}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingNotifications ? "Updating..." : "Update Preferences"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
               <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Protect your account with stronger security.</p>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Change Password</h4>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                  <div className="flex gap-4 items-start">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg shrink-0">
                      <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-500">Two-Factor Authentication</h4>
                      <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                        Add an extra layer of security to your account. We will send a verification code to your phone every time you sign in on a new device.
                      </p>
                      <button className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
