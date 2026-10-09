'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookmarkCheck, Trash2, Layers, Sparkles, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SavedOutfitsPage() {
  const router = useRouter();
  const { savedOutfits, deleteSavedOutfit, loadOutfitIntoBuilder } = useApp();

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase font-semibold mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Lookbook Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Saved Outfits</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Your personal catalog of favorite pairings and composed silhouettes.
          </p>
        </div>

        <Link
          href="/outfit-builder"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Build New Look</span>
        </Link>
      </div>

      {savedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedOutfits.map((look) => (
            <div
              key={look.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-neutral-700 transition-all shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono font-semibold text-neutral-300">
                      {look.occasion}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {look.harmonyScore}% Harmony
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{look.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      loadOutfitIntoBuilder(look.items);
                      router.push('/outfit-builder');
                    }}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Load into Builder"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                  </button>
                  <button
                    onClick={() => deleteSavedOutfit(look.id)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Outfit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Garment thumb row */}
              <div className="grid grid-cols-4 gap-2">
                {look.items.map((item) => (
                  <div key={item.id} className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-lg mb-1"
                    />
                    <span className="text-[10px] text-neutral-400 truncate block font-medium">{item.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                <span>Created {look.createdAt}</span>
                <span>{look.items.length} garments</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <BookmarkCheck className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Outfits Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Compose a look in the Outfit Builder or save a recommendation to save it here.
          </p>
          <Link
            href="/outfit-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs"
          >
            <span>Start Building Outfits</span>
          </Link>
        </div>
      )}
    </div>
  );
}
