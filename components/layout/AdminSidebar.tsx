'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Users,
  Activity,
  Server,
  Terminal,
  LogOut,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AdminSidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '', onItemClick }) => {
  const pathname = usePathname();
  const { currentUser, users, wardrobe, logout } = useApp();

  const adminNavItems = [
    { label: 'Admin Overview', href: '/admin', icon: Activity },
    { label: 'Users Directory', href: '/admin/users', icon: Users, badge: users.length.toString() },
    { label: 'Wardrobe Audit', href: '/admin/wardrobe', icon: Server, badge: wardrobe.length.toString() },
    { label: 'AI Cluster Telemetry', href: '/admin/analytics', icon: Cpu },
  ];

  return (
    <aside
      className={`w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      <div>
        {/* Admin Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3" onClick={onItemClick}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-sm block font-mono">
                OPS // ADMIN
              </span>
              <span className="text-[10px] tracking-widest text-amber-400/90 uppercase font-semibold">
                Control Plane v2.4
              </span>
            </div>
          </Link>
        </div>

        {/* AI Cluster Health Status */}
        <div className="mx-3 my-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">AI Model Cluster</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-1 space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Operations Management
          </div>

          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-amber-500/30 text-amber-200'
                        : 'bg-slate-900 text-slate-500 group-hover:text-slate-400'
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

      {/* Footer Area with Admin Logout and Switch to User View */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Switch to User App */}
        <Link
          href="/"
          onClick={onItemClick}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <span>Open Stylist User App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Admin Details */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Root SuperAdmin</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">{currentUser?.name || 'Sophia Laurent'}</p>
        </div>

        {/* Dedicated Admin Logout Button */}
        <button
          onClick={() => {
            onItemClick?.();
            logout();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer group"
          title="Sign out of Admin Session"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span>Sign Out Admin</span>
          </div>
          <span className="text-[10px] text-slate-400 group-hover:text-rose-400">LOCK</span>
        </button>
      </div>
    </aside>
  );
};
