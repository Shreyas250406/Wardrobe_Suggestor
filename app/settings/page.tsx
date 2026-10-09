'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Check,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'Account' | 'Security' | 'Notifications' | 'Privacy'>('Account');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  if (!currentUser) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-neutral-900/60 border border-neutral-800 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">No Active Session</h2>
        <p className="text-sm text-neutral-400 mb-6">Please sign in to configure your account settings.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const tabs = [
    { id: 'Account', label: 'Account', icon: User },
    { id: 'Security', label: 'Security & Tokens', icon: Lock },
    { id: 'Notifications', label: 'Stylist Alerts', icon: Bell },
    { id: 'Privacy', label: 'Privacy & Data', icon: Shield },
  ] as const;

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage your AI Wardrobe Suggestor preferences, notifications, and security.
          </p>
        </div>

        {/* Global Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-rose-500/15 text-neutral-300 hover:text-rose-300 border border-neutral-800 hover:border-rose-500/30 font-semibold text-xs transition-all cursor-pointer self-start sm:self-auto"
          title="Sign out of current account"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* TAB LIST (3 cols) */}
        <div className="md:col-span-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT (9 cols) */}
        <div className="md:col-span-9 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'Account' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white">Account Information</h3>
                  <p className="text-xs text-neutral-400">Personal contact details and credentials.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white">Security &amp; Passwords</h3>
                  <p className="text-xs text-neutral-400">Manage encryption tokens and session credentials.</p>
                </div>
                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">Current Password</label>
                    <input
                      type="password"
                      defaultValue="demo123"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white">Stylist Alert Preferences</h3>
                  <p className="text-xs text-neutral-400">Configure daily outfit triggers.</p>
                </div>
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-white block">Weather-Aware Daily Outfits</span>
                    <span className="text-[11px] text-neutral-400">
                      Receive morning suggestions matched to local forecast.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weatherAlerts}
                    onChange={(e) => setWeatherAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-white block">Weekly Wardrobe Rotation Digest</span>
                    <span className="text-[11px] text-neutral-400">
                      Insights into least-worn garments and fresh pairings.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            )}

            {activeTab === 'Privacy' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white">Privacy &amp; Data Rights</h3>
                  <p className="text-xs text-neutral-400">Control AI neural embeddings and image storage.</p>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your uploaded garment images and extracted embeddings are encrypted and never shared with third-party advertising brokers.
                </p>
              </div>
            )}

            {/* Save & Feedback */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Settings updated successfully!
                </span>
              ) : (
                <span className="text-xs text-neutral-500 font-mono">Changes active immediately</span>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
