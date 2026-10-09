'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Palette,
  LogOut,
  LogIn,
  Check,
  Shirt,
  Heart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const { currentUser, wardrobe, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [preferences, setPreferences] = useState(
    currentUser?.preferences || {
      preferredStyles: ['Minimal', 'Old Money', 'Streetwear'],
      favoriteColors: ['White', 'Navy', 'Beige', 'Black'],
      preferredOccasions: ['Smart Casual', 'Casual', 'Formal'],
      preferredSeasons: ['All-Season', 'Autumn'],
      colorHarmonyMode: 'Neutral-Focused',
    }
  );

  if (!currentUser) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-neutral-900/60 border border-neutral-800 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">No Active Session</h2>
        <p className="text-sm text-neutral-400 mb-6">Please sign in to view and customize your wardrobe profile.</p>
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

  const handleSavePreferences = () => {
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* 1. PROFILE HEADER */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-2 ring-amber-400/40 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-400 text-neutral-950 font-bold shadow">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
                {currentUser.role === 'admin' ? 'SuperAdmin' : 'AI Pro Stylist'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentUser.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {currentUser.joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={() => {
              if (isEditing) {
                handleSavePreferences();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            <span>{isEditing ? 'Done Editing' : 'Edit Style Taste'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 border border-neutral-700 hover:border-rose-500/40 font-semibold text-xs tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Log out of this user session"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Style preferences updated successfully!</span>
        </div>
      )}

      {/* 2. STYLE PREFERENCES */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span>Aesthetic Preferences &amp; AI Engine Tuning</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              These attributes guide the neural recommendation engine when scoring daily looks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-neutral-400 block font-semibold">
              Preferred Aesthetics
            </span>
            <div className="flex flex-wrap gap-2">
              {preferences.preferredStyles.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-neutral-400 block font-semibold">
              Signature Color Palette
            </span>
            <div className="flex flex-wrap gap-2">
              {preferences.favoriteColors.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white font-medium flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span>{c}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-neutral-400 block font-semibold">
              Frequent Occasions
            </span>
            <div className="flex flex-wrap gap-2">
              {preferences.preferredOccasions.map((o) => (
                <span
                  key={o}
                  className="px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white font-medium"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-neutral-400 block font-semibold">
              Color Harmony Algorithm Mode
            </span>
            <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-semibold">
              {preferences.colorHarmonyMode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
