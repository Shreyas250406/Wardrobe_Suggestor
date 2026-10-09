'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, LogIn, CheckCircle2, UserX, Shield, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminUsersPage() {
  const router = useRouter();
  const { users, switchUser, currentUser, logout } = useApp();
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase text-amber-400 font-bold mb-1">
            <Users className="w-4 h-4" />
            <span>Platform User Directory ({users.length} accounts)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Users Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit user accounts, suspension states, and test multi-user sessions.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Wardrobe Items</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Session Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700" />
                      <div>
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{u.status}</span>
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">{u.wardrobeCount} items</td>
                    <td className="p-4 text-slate-400">{u.joinedDate}</td>

                    <td className="p-4 text-right">
                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs">
                          Current Active
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            switchUser(u);
                            window.location.href = u.role === 'admin' ? '/admin' : '/';
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-neutral-950 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Switch Session</span>
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
