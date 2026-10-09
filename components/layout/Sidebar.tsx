'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Layers,
  BookmarkCheck,
  User,
  Settings,
  Shield,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onItemClick }) => {
  const pathname = usePathname();
  const { currentUser, wardrobe, savedOutfits, logout } = useApp();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Wardrobe', href: '/wardrobe', icon: Shirt, badge: wardrobe.length.toString() },
    { label: 'AI Outfits', href: '/recommendations', icon: Sparkles },
    { label: 'Outfit Builder', href: '/outfit-builder', icon: Layers },
    { label: 'Saved Looks', href: '/saved-outfits', icon: BookmarkCheck, badge: savedOutfits.length.toString() },
  ];

  const bottomItems = [
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 bg-neutral-950 text-neutral-100 border-r border-neutral-800/80 flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-neutral-800/60">
          <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-[1.5px] shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base block font-sans">
                AI Wardrobe
              </span>
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-semibold">
                Suggestor Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <Link
            href="/wardrobe?add=true"
            onClick={onItemClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 hover:border-amber-400/50 font-semibold text-xs tracking-wide transition-all shadow-sm group"
          >
            <PlusCircle className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Clothing Item</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="px-3 py-1 space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-neutral-400 uppercase">
            Wardrobe Suite
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-neutral-850 text-white shadow-inner border border-neutral-750 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-neutral-400 group-hover:text-neutral-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? 'bg-neutral-700 text-neutral-200'
                        : 'bg-neutral-900 text-neutral-400 group-hover:text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Account & Logout Area */}
      <div className="p-3 border-t border-neutral-800/60 space-y-1">
        <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-neutral-400 uppercase">
          System &amp; Account
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-850 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* User Card with Logout Button */}
        {currentUser ? (
          <div className="mt-2 pt-2 border-t border-neutral-850 space-y-1.5">
            <Link
              href="/profile"
              onClick={onItemClick}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800/80 transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate font-mono">{currentUser.email}</p>
              </div>
            </Link>

            {/* Logout Action */}
            <button
              onClick={() => {
                onItemClick?.();
                logout();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer group"
              title="Log out of session"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-rose-400 transition-colors" />
                <span>Log Out</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 group-hover:text-rose-400">Exit</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-neutral-850">
            <Link
              href="/login"
              onClick={onItemClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
            >
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
