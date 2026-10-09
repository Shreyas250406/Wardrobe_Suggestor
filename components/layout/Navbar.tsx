'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LogOut, LogIn, Menu, Sparkles, Shield, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const { currentUser, searchQuery, setSearchQuery, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Mobile Menu Button + Title */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">AI Wardrobe</span>
        </Link>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search wardrobe items, colors, occasions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 text-neutral-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-neutral-800 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Supabase Cloud Live Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Supabase Cloud</span>
        </div>

        {currentUser ? (
          <>
            {pathname.startsWith('/admin') ? (
              <>
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>User View</span>
                </Link>

                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <span className="text-xs font-semibold text-white font-mono hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Root
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm"
                  title="Sign out of Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold hover:bg-amber-500/25 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800/80 transition-colors group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-700"
                  />
                  <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300">
                    Stylist
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-rose-500/15 border border-neutral-800 hover:border-rose-500/30 text-neutral-400 hover:text-rose-300 text-xs font-medium transition-all cursor-pointer shadow-sm"
                  title="Log out of session"
                >
                  <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
