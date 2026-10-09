'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Navbar } from './Navbar';
import { X, ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, isAuthLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminRoute = pathname.startsWith('/admin');

  // Enforce authentication on all app routes
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !isAuthPage) {
      router.replace('/login');
    }
  }, [isAuthLoading, isAuthenticated, isAuthPage, router]);

  // Loading screen during session bootstrap
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Loading AI Wardrobe Session...</span>
        </div>
      </div>
    );
  }

  // Auth pages render full-screen with no navigation bars
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col justify-center relative overflow-hidden">
        {children}
      </div>
    );
  }

  // Unauthenticated fallback while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-sm">
          <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto block" />
          <p className="text-xs text-neutral-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Role separation: If user tries to access /admin without admin privileges
  if (isAdminRoute && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Clearance Required</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              The Admin Control Plane is restricted to platform administrators. Your account ({currentUser?.name}) is currently signed in as a <span className="text-amber-300 font-semibold font-mono">Stylist User</span>.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Stylist User App</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Admin Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isAdminRoute ? 'bg-slate-950 text-slate-100' : 'bg-[#0b0b0d] text-neutral-100'
      }`}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Admin vs User) */}
        <div className="hidden lg:block shrink-0">
          {isAdminRoute ? (
            <AdminSidebar className="h-screen sticky top-0" />
          ) : (
            <Sidebar className="h-screen sticky top-0" />
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-neutral-950 z-10 shadow-2xl border-r border-neutral-800">
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {isAdminRoute ? (
                <AdminSidebar className="w-full h-full" onItemClick={() => setMobileMenuOpen(false)} />
              ) : (
                <Sidebar className="w-full h-full" onItemClick={() => setMobileMenuOpen(false)} />
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
