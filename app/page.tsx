'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Shirt,
  Layers,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  CloudSun,
  BookmarkCheck,
  Compass,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { AddClothingModal } from '@/components/wardrobe/AddClothingModal';
import { generateColorMatrixOutfits } from '@/lib/ai/outfitGenerator';

export default function DashboardPage() {
  const { currentUser, wardrobe, savedOutfits, loadOutfitIntoBuilder } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const dynamicOutfits = useMemo(() => generateColorMatrixOutfits(wardrobe), [wardrobe]);
  const outfitOfTheDay = dynamicOutfits[0];

  const firstName = currentUser ? currentUser.name.split(' ')[0] : 'Stylist';

  const recentItems = wardrobe.slice(0, 4);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* GREETING & WEATHER BANNER */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Fashion Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Today&apos;s styling recommendation is optimized for clean neutral layering and 96% color compatibility.
          </p>
        </div>

        {/* Weather / Location pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
            <CloudSun className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">24°C • Partly Sunny</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {currentUser?.location || 'Mumbai, India'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Garment</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/wardrobe"
          className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-medium">Digital Wardrobe</span>
            <Shirt className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{wardrobe.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">Processed items</span>
        </Link>

        <Link
          href="/recommendations"
          className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-medium">AI Suggestions</span>
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{dynamicOutfits.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">Ready for today</span>
        </Link>

        <Link
          href="/saved-outfits"
          className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-medium">Saved Looks</span>
            <BookmarkCheck className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{savedOutfits.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">Bookmarked outfits</span>
        </Link>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-medium">Harmony Rating</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {outfitOfTheDay ? `${outfitOfTheDay.harmonyScore}%` : '95%'}
          </span>
          <span className="text-[11px] text-neutral-500 block mt-1">Palette synergy</span>
        </div>
      </div>

      {/* OUTFIT OF THE DAY CARD */}
      {outfitOfTheDay && (
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono font-semibold uppercase">
                  Featured Daily Look
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {outfitOfTheDay.harmonyScore}% Harmony
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{outfitOfTheDay.title}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{outfitOfTheDay.stylistNote}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/outfit-builder"
                onClick={() => loadOutfitIntoBuilder(outfitOfTheDay.items)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open in Builder</span>
              </Link>
            </div>
          </div>

          {/* Garment Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {outfitOfTheDay.items.map((item) => (
              <div key={item.id} className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.croppedImageUrl || item.imageUrl}
                  alt={item.name}
                  className="w-full aspect-[3/4] object-contain rounded-xl mb-2 group-hover:scale-102 transition-transform bg-white p-1"
                />
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">{item.category}</span>
                <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.colorHex }} />
                  <span className="text-[10px] text-neutral-500">{item.color}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Color Matrix & Notes */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 border-t border-neutral-800/80">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase">Active Color Palette:</span>
              <div className="flex items-center gap-1.5">
                {outfitOfTheDay.colorPalette.map((hex) => (
                  <span
                    key={hex}
                    className="w-4 h-4 rounded-full ring-1 ring-neutral-700"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
            <span className="italic font-sans text-neutral-400 text-[11px]">
              &quot;{outfitOfTheDay.stylistNote}&quot;
            </span>
          </div>
        </section>
      )}

      {/* RECENT WARDROBE ITEMS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Closet Additions</h2>
            <p className="text-xs text-neutral-400">Items tagged by computer vision and ready for composition</p>
          </div>
          <Link
            href="/wardrobe"
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            <span>View All ({wardrobe.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentItems.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ADD CLOTHING MODAL */}
      <AddClothingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
