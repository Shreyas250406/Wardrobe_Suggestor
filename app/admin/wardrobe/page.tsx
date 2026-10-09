'use client';

import React from 'react';
import { Server, Shirt, CheckCircle2, Shield, Eye, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminWardrobePage() {
  const { wardrobe, logout } = useApp();

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase text-amber-400 font-bold mb-1">
            <Server className="w-4 h-4" />
            <span>Garment Catalog Audit ({wardrobe.length} items)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Catalog &amp; Segmentation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit YOLO11n clothing detections, SAM 2.1 masks, and color clustering values.
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

      {/* Grid of Garments with Audit Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wardrobe.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="overflow-hidden flex-1">
                <span className="text-[10px] text-amber-400 font-bold block">{item.category}</span>
                <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.colorHex }} />
                  <span>{item.color}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Segmentation Pass</span>
              </span>
              <span>Worn {item.wearCount}x</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
