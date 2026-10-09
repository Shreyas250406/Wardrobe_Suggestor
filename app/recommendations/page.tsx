'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Layers,
  BookmarkCheck,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Palette,
  Lightbulb,
  Shirt,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  generateColorMatrixOutfits,
  OutfitFilterCriteria,
  GeneratedEnsemble,
} from '@/lib/ai/outfitGenerator';

export default function RecommendationsPage() {
  const router = useRouter();
  const { wardrobe, currentUser, saveOutfit, loadOutfitIntoBuilder } = useApp();

  // Filter States
  const [occasion, setOccasion] = useState<string>('All');
  const [season, setSeason] = useState<string>('All');
  const [harmonyMode, setHarmonyMode] = useState<string>('All');
  const [style, setStyle] = useState<string>('All');
  const [selectedTopId, setSelectedTopId] = useState<string>('All');

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available Tops in the user's wardrobe for dropdown/filter
  const wardrobeTops = useMemo(
    () => wardrobe.filter((i) => i.category === 'Tops'),
    [wardrobe]
  );

  // Generate Ensembles using Color Matrix based on current attribute filters
  const filterCriteria: OutfitFilterCriteria = useMemo(
    () => ({
      occasion,
      season,
      harmonyMode,
      style,
      selectedTopId,
    }),
    [occasion, season, harmonyMode, style, selectedTopId]
  );

  const ensembles: GeneratedEnsemble[] = useMemo(
    () => generateColorMatrixOutfits(wardrobe, filterCriteria),
    [wardrobe, filterCriteria]
  );

  // Handlers
  const handleResetFilters = () => {
    setOccasion('All');
    setSeason('All');
    setHarmonyMode('All');
    setStyle('All');
    setSelectedTopId('All');
  };

  const handleApplyPreset = (presetOccasion: string, presetMode: string, presetSeason: string = 'All') => {
    setOccasion(presetOccasion);
    setHarmonyMode(presetMode);
    setSeason(presetSeason);
    setSelectedTopId('All');
  };

  const handleSaveOutfit = (ensemble: GeneratedEnsemble) => {
    if (savedIds.includes(ensemble.id)) return;

    saveOutfit({
      id: `saved-${Date.now()}-${ensemble.id}`,
      name: ensemble.title,
      occasion: ensemble.occasion as any,
      season: ensemble.season as any,
      harmonyScore: ensemble.harmonyScore,
      items: ensemble.items,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: ensemble.stylistNote,
    });

    setSavedIds((prev) => [...prev, ensemble.id]);
  };

  /**
   * Copies the exact clothes selected in this AI outfit card directly
   * into the Outfit Builder slots, then redirects to /outfit-builder.
   */
  const handleTryOnOutfitBuilder = (ensemble: GeneratedEnsemble) => {
    setCopiedId(ensemble.id);
    loadOutfitIntoBuilder(ensemble.items);

    setTimeout(() => {
      router.push('/outfit-builder');
    }, 250);
  };

  const occasionsList = ['All', 'Casual', 'Smart Casual', 'Formal', 'Sport', 'Party'];
  const seasonsList = ['All', 'All-Season', 'Summer', 'Autumn', 'Winter', 'Spring'];
  const harmonyModesList = ['All', 'Neutral-Focused', 'Contrast', 'Monochromatic'];
  const stylesList = ['All', 'Minimal', 'Classic', 'Streetwear', 'Old Money', 'Athleisure'];

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-6xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Outfits • Neural Color Matrix Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Outfit Stylist
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Set your target attributes below: candidate tops are selected, and other garments are paired via Color Matrix theory.
          </p>
        </div>

        {/* User Capsule Pill */}
        {currentUser && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 self-start md:self-auto text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">Styling for:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              {wardrobe.length} closet items
            </span>
          </div>
        )}
      </div>

      {/* 2. ATTRIBUTE FILTERS AT START (Interactive Control Panel) */}
      <div className="p-6 rounded-3xl bg-neutral-900/95 backdrop-blur-md border border-neutral-800 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>1. Set Your Outfit Attributes & Filters</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">
              Generated: <strong className="text-amber-400">{ensembles.length} Outfits</strong>
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Attribute Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Occasion */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Occasion</span>
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              {occasionsList.map((occ) => (
                <option key={occ} value={occ}>
                  {occ === 'All' ? 'All Occasions' : occ}
                </option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Season</span>
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              {seasonsList.map((sea) => (
                <option key={sea} value={sea}>
                  {sea === 'All' ? 'All Seasons' : sea}
                </option>
              ))}
            </select>
          </div>

          {/* Color Harmony Mode */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span>Color Harmony</span>
            </label>
            <select
              value={harmonyMode}
              onChange={(e) => setHarmonyMode(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              {harmonyModesList.map((mode) => (
                <option key={mode} value={mode}>
                  {mode === 'All' ? 'Balanced Matrix (All)' : mode}
                </option>
              ))}
            </select>
          </div>

          {/* Style Aesthetic */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Style Aesthetic</span>
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              {stylesList.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Styles' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Anchor Top Selection (Optional filter) */}
        <div className="pt-2 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-mono text-neutral-400 shrink-0 flex items-center gap-1">
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
              <span>Anchor Top Filter:</span>
            </span>
            <select
              value={selectedTopId}
              onChange={(e) => setSelectedTopId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors max-w-sm truncate"
            >
              <option value="All">All Matching Tops in Closet ({wardrobeTops.length})</option>
              {wardrobeTops.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.name} ({top.color})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Style Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('Smart Casual', 'Neutral-Focused')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              Smart Casual
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Casual', 'Contrast')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              Weekend Chill
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Formal', 'Neutral-Focused')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              Business Formal
            </button>
          </div>
        </div>
      </div>

      {/* 3. OUTFIT CARDS (SEPARATED ONE BELOW THE OTHER) */}
      <div className="space-y-8">
        {ensembles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-neutral-900/60 border border-neutral-800 rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mx-auto flex items-center justify-center">
              <Shirt className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Matching Outfits Found</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                No tops in your wardrobe matched the selected attribute filters. Try selecting &quot;All&quot; to view outfits generated for your closet garments.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          ensembles.map((ensemble, idx) => {
            const isSaved = savedIds.includes(ensemble.id);
            const isCopied = copiedId === ensemble.id;

            return (
              /* CARD SEPARATED ONE BELOW OTHER */
              <div
                key={ensemble.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-all relative overflow-hidden"
              >
                {/* Accent top stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 opacity-60" />

                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                        Look #{idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono font-semibold">
                        {ensemble.occasion}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono font-semibold">
                        {ensemble.season}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                        {ensemble.archetype}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {ensemble.title}
                    </h2>
                    <p className="text-xs text-neutral-400 max-w-2xl">
                      Anchor Top:{' '}
                      <strong className="text-neutral-200">{ensemble.top.name}</strong> ({ensemble.top.color}) paired with{' '}
                      Color Matrix matching bottom, footwear & companion layers.
                    </p>
                  </div>

                  {/* Harmony Score Pill */}
                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                        Color Matrix Score
                      </span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          {ensemble.harmonyScore}%
                        </span>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-black text-emerald-300 text-sm">
                      {ensemble.harmonyScore}
                    </div>
                  </div>
                </div>

                {/* GARMENTS DISPLAY (Top, Bottom, Shoes, Outerwear, Accessory) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {/* 1. ANCHOR TOP */}
                  <div className="p-3 rounded-2xl bg-neutral-950 border-2 border-amber-400/40 relative flex flex-col justify-between group">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
                        ★ Anchor Top
                      </span>
                    </div>

                    <div className="pt-5 pb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ensemble.top.croppedImageUrl || ensemble.top.imageUrl}
                        alt={ensemble.top.name}
                        className="w-full aspect-[3/4] object-contain rounded-xl bg-white p-2 group-hover:scale-102 transition-transform shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-amber-400 uppercase font-semibold block">
                        Tops • Filter Selected
                      </span>
                      <h4 className="text-xs font-bold text-white truncate" title={ensemble.top.name}>
                        {ensemble.top.name}
                      </h4>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0"
                          style={{ backgroundColor: ensemble.top.colorHex }}
                        />
                        <span className="text-[11px] text-neutral-300 font-mono truncate">
                          {ensemble.top.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. COLOR MATRIX BOTTOM */}
                  {ensemble.bottom ? (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 relative flex flex-col justify-between group">
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono font-bold uppercase">
                          Bottom
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                          {ensemble.colorCompatibility.topBottom}% Matrix
                        </span>
                      </div>

                      <div className="pt-5 pb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ensemble.bottom.croppedImageUrl || ensemble.bottom.imageUrl}
                          alt={ensemble.bottom.name}
                          className="w-full aspect-[3/4] object-contain rounded-xl bg-white p-2 group-hover:scale-102 transition-transform shadow-inner"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold block">
                          Bottoms • Coordinated
                        </span>
                        <h4 className="text-xs font-bold text-white truncate" title={ensemble.bottom.name}>
                          {ensemble.bottom.name}
                        </h4>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0"
                            style={{ backgroundColor: ensemble.bottom.colorHex }}
                          />
                          <span className="text-[11px] text-neutral-300 font-mono truncate">
                            {ensemble.bottom.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 3. COLOR MATRIX FOOTWEAR */}
                  {ensemble.shoes ? (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 relative flex flex-col justify-between group">
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono font-bold uppercase">
                          Shoes
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                          {ensemble.colorCompatibility.topShoes}% Matrix
                        </span>
                      </div>

                      <div className="pt-5 pb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ensemble.shoes.croppedImageUrl || ensemble.shoes.imageUrl}
                          alt={ensemble.shoes.name}
                          className="w-full aspect-[3/4] object-contain rounded-xl bg-white p-2 group-hover:scale-102 transition-transform shadow-inner"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold block">
                          Shoes • Grounding
                        </span>
                        <h4 className="text-xs font-bold text-white truncate" title={ensemble.shoes.name}>
                          {ensemble.shoes.name}
                        </h4>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0"
                            style={{ backgroundColor: ensemble.shoes.colorHex }}
                          />
                          <span className="text-[11px] text-neutral-300 font-mono truncate">
                            {ensemble.shoes.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 4. OUTERWEAR (IF MATCHED) */}
                  {ensemble.outerwear ? (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 relative flex flex-col justify-between group">
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold uppercase">
                          Outerwear Layer
                        </span>
                      </div>

                      <div className="pt-5 pb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ensemble.outerwear.croppedImageUrl || ensemble.outerwear.imageUrl}
                          alt={ensemble.outerwear.name}
                          className="w-full aspect-[3/4] object-contain rounded-xl bg-white p-2 group-hover:scale-102 transition-transform shadow-inner"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold block">
                          Outerwear • Layering
                        </span>
                        <h4 className="text-xs font-bold text-white truncate" title={ensemble.outerwear.name}>
                          {ensemble.outerwear.name}
                        </h4>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0"
                            style={{ backgroundColor: ensemble.outerwear.colorHex }}
                          />
                          <span className="text-[11px] text-neutral-300 font-mono truncate">
                            {ensemble.outerwear.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 5. ACCESSORY (IF MATCHED) */}
                  {ensemble.accessory ? (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 relative flex flex-col justify-between group">
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold uppercase">
                          Accessory
                        </span>
                      </div>

                      <div className="pt-5 pb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ensemble.accessory.croppedImageUrl || ensemble.accessory.imageUrl}
                          alt={ensemble.accessory.name}
                          className="w-full aspect-[3/4] object-contain rounded-xl bg-white p-2 group-hover:scale-102 transition-transform shadow-inner"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold block">
                          Accessory • Accent
                        </span>
                        <h4 className="text-xs font-bold text-white truncate" title={ensemble.accessory.name}>
                          {ensemble.accessory.name}
                        </h4>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0"
                            style={{ backgroundColor: ensemble.accessory.colorHex }}
                          />
                          <span className="text-[11px] text-neutral-300 font-mono truncate">
                            {ensemble.accessory.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Color Spectrum Chips & Stylist Harmony Note */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ensemble Palette:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {ensemble.colorPalette.map((hex) => (
                        <span
                          key={hex}
                          className="w-5 h-5 rounded-full ring-2 ring-neutral-800 shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{ensemble.stylistNote}</span>
                  </div>
                </div>

                {/* ACTION BUTTONS (TRY ON OUTFIT BUILDER & SAVE) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Copies all {ensemble.items.length} pieces into the Outfit Builder canvas.
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Save Look Button */}
                    <button
                      type="button"
                      onClick={() => handleSaveOutfit(ensemble)}
                      disabled={isSaved}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkCheck className="w-4 h-4" />}
                      <span>{isSaved ? 'Look Saved' : 'Save Look'}</span>
                    </button>

                    {/* PROMINENT "TRY ON OUTFIT BUILDER" BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleTryOnOutfitBuilder(ensemble)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-neutral-950" />
                      <span>Try on Outfit Builder</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-950" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
