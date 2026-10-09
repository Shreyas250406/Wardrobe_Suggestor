'use client';

import React from 'react';
import { Cpu, Activity, Zap, Server, Shield, CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminAnalyticsPage() {
  const { logout } = useApp();

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase text-amber-400 font-bold mb-1">
            <Cpu className="w-4 h-4" />
            <span>AI Neural Infrastructure Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Cluster Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Model checkpoint states, GPU acceleration, and inference worker throughput.
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

      {/* Neural Models Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">YOLO11n Apparel Detector</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              WEIGHTS LOADED
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between"><span>Checkpoint:</span><span className="text-white">yolo11n.pt (5.6 MB)</span></div>
            <div className="flex justify-between"><span>Mean Average Precision:</span><span className="text-emerald-400">mAP@50: 92.4%</span></div>
            <div className="flex justify-between"><span>Inference Latency:</span><span className="text-white">18ms / frame</span></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">SAM 2.1 Segment Anything</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              WEIGHTS LOADED
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between"><span>Checkpoint:</span><span className="text-white">sam2.1_t.pt (78.1 MB)</span></div>
            <div className="flex justify-between"><span>Mask IoU Score:</span><span className="text-indigo-400">0.941 IoU</span></div>
            <div className="flex justify-between"><span>Background Cutout:</span><span className="text-emerald-400">Alpha Blending Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
