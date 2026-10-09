'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Cpu,
  Activity,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminPage() {
  const router = useRouter();
  const { users, wardrobe, switchUser, logout, currentUser } = useApp();

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Admin Control Plane</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System &amp; Users</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Monitor AI pipeline clusters, user accounts, and model inference latency.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-rose-500/15 text-neutral-300 hover:text-rose-300 border border-neutral-800 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
          title="Sign out of Admin Session"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      {/* CLUSTER HEALTH STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">AI Model Cluster</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">ONLINE</span>
          <span className="text-[11px] text-neutral-500 block mt-1">YOLO11n + SAM 2.1</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Inference Latency</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">142ms</span>
          <span className="text-[11px] text-neutral-500 block mt-1">p95 response time</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Platform Accounts</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">{users.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">Active users</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Catalog Items</span>
            <Server className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">{wardrobe.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">Segmented garments</span>
        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Registered Users</h2>
            <p className="text-xs text-neutral-400">Manage user states and test multi-user sessions</p>
          </div>
          <span className="text-xs font-mono text-neutral-500">{users.length} total accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Wardrobe Items</th>
                <th className="p-4 text-right">Quick Session Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700" />
                      <div>
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{u.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{u.status}</span>
                      </span>
                    </td>

                    <td className="p-4 font-mono text-neutral-300">{u.wardrobeCount} items</td>

                    <td className="p-4 text-right">
                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-mono">
                          Current Active
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            switchUser(u);
                            router.push('/');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-neutral-950 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Log In As User</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
