'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  BookmarkCheck,
  Check,
  Plus,
  X,
  Shirt,
  Wand2,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ClothingCategory, WardrobeItem } from '@/types/wardrobe';
import {
  getSuggestionsForGarment,
  evaluateEnsembleHarmony,
  getPairwiseColorScore,
} from '@/lib/ai/colorMatrix';

export default function OutfitBuilderPage() {
  const {
    wardrobe,
    currentOutfit,
    updateOutfitSelection,
    clearOutfitSelection,
    saveOutfit,
  } = useApp();

  const [activeSlot, setActiveSlot] = useState<ClothingCategory>('Tops');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const slotItems: { label: string; key: keyof typeof currentOutfit; category: ClothingCategory }[] = [
    { label: 'Top', key: 'top', category: 'Tops' },
    { label: 'Bottom', key: 'bottom', category: 'Bottoms' },
    { label: 'Outerwear', key: 'outerwear', category: 'Outerwear' },
    { label: 'Shoes', key: 'shoes', category: 'Shoes' },
    { label: 'Accessory', key: 'accessory', category: 'Accessories' },
  ];

  const slotKeyMap: Record<ClothingCategory, keyof typeof currentOutfit> = {
    Tops: 'top',
    Bottoms: 'bottom',
    Outerwear: 'outerwear',
    Shoes: 'shoes',
    Accessories: 'accessory',
  };

  const selectedItems = useMemo(
    () => (Object.values(currentOutfit).filter(Boolean) as WardrobeItem[]),
    [currentOutfit]
  );

  // Evaluate full ensemble harmony with AI Color Matrix
  const ensembleAnalysis = useMemo(
    () => evaluateEnsembleHarmony(selectedItems),
    [selectedItems]
  );

  // Active anchor piece for AI partner recommendations
  const activeAnchorItem = useMemo(() => {
    const fromActive = currentOutfit[slotKeyMap[activeSlot]];
    if (fromActive) return fromActive;
    return selectedItems[0] || null;
  }, [currentOutfit, activeSlot, selectedItems]);

  // AI partner suggestions for current active piece
  const aiSuggestions = useMemo(() => {
    if (!activeAnchorItem) return [];
    return getSuggestionsForGarment(activeAnchorItem, wardrobe);
  }, [activeAnchorItem, wardrobe]);

  // Suggestions filtered for the active slot
  const suggestionsForActiveSlot = useMemo(() => {
    if (!activeAnchorItem) return [];
    return getSuggestionsForGarment(activeAnchorItem, wardrobe, activeSlot);
  }, [activeAnchorItem, wardrobe, activeSlot]);

  const availableForSlot = wardrobe.filter((i) => i.category === activeSlot);

  // Auto-complete empty slots with top AI color matches
  const handleAutoCompleteOutfit = () => {
    if (!activeAnchorItem && wardrobe.length > 0) {
      // Pick first item as anchor
      updateOutfitSelection('top', wardrobe[0]);
      return;
    }

    if (!activeAnchorItem) return;

    const categoriesNeeded: ClothingCategory[] = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];

    categoriesNeeded.forEach((cat) => {
      const slotKey = slotKeyMap[cat];
      if (!currentOutfit[slotKey]) {
        const topMatches = getSuggestionsForGarment(activeAnchorItem, wardrobe, cat);
        if (topMatches.length > 0) {
          updateOutfitSelection(slotKey, topMatches[0].item);
        }
      }
    });
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return;

    saveOutfit({
      id: `saved-${Date.now()}`,
      name: `${ensembleAnalysis.archetype} (${selectedItems.length} pieces)`,
      occasion: 'Smart Casual',
      season: 'All-Season',
      harmonyScore: ensembleAnalysis.score,
      items: selectedItems,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>Studio Outfit Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Interactive Canvas</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Mix and match garments with real-time neural color compatibility evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleAutoCompleteOutfit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 transition-all cursor-pointer"
            title="Auto-pair companion pieces using Color Compatibility Matrix"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Auto-Complete</span>
          </button>

          <button
            onClick={clearOutfitSelection}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={handleSave}
            disabled={selectedItems.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-white hover:bg-neutral-100 text-neutral-950 disabled:opacity-50'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <BookmarkCheck className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved Look!' : 'Save Look'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: OUTFIT SLOTS CANVAS (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Silhouette status banner with Color Matrix analysis */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Current Ensemble</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  {selectedItems.length} Pieces
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{ensembleAnalysis.stylistNote}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300">
                {ensembleAnalysis.archetype}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ensembleAnalysis.score}% Harmony</span>
              </div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slotItems.map((slot) => {
              const item = currentOutfit[slot.key];
              const isSlotActive = activeSlot === slot.category;

              // Pairwise score against anchor item
              let matchBadge = null;
              if (item && activeAnchorItem && item.id !== activeAnchorItem.id) {
                const pairScore = getPairwiseColorScore(activeAnchorItem.color, item.color);
                matchBadge = (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {pairScore}% Match
                  </span>
                );
              }

              return (
                <div
                  key={slot.key}
                  onClick={() => setActiveSlot(slot.category)}
                  className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-[3/4] ${
                    isSlotActive
                      ? 'border-amber-400 bg-neutral-900 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase mb-2">
                    <span className={isSlotActive ? 'text-amber-400 font-bold' : ''}>{slot.label}</span>
                    <div className="flex items-center gap-1">
                      {matchBadge}
                      {item && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOutfitSelection(slot.key, undefined);
                          }}
                          className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item ? (
                    <div className="flex-1 flex flex-col justify-between">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.croppedImageUrl || item.imageUrl}
                        alt={item.name}
                        className="w-full h-28 object-contain rounded-xl bg-neutral-950 p-1"
                      />
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-700 flex-shrink-0"
                            style={{ backgroundColor: item.colorHex || '#FFFFFF' }}
                          />
                          <p className="text-[10px] text-neutral-400 truncate">{item.color} • {item.style}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors">
                      <Plus className="w-6 h-6 mb-1 text-neutral-600" />
                      <span className="text-[11px] font-medium">Select {slot.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Color Harmony Suggestion Bar (When active item is present) */}
          {activeAnchorItem && (
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    AI Color Matrix Matches for: {activeAnchorItem.color} {activeAnchorItem.category}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ranking Matrix Active</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aiSuggestions.slice(0, 4).map((sugg) => (
                  <div
                    key={sugg.item.id}
                    onClick={() => updateOutfitSelection(slotKeyMap[sugg.item.category], sugg.item)}
                    className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/60 transition-all cursor-pointer group"
                  >
                    <div className="relative mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sugg.item.imageUrl}
                        alt={sugg.item.name}
                        className="w-full aspect-square object-contain rounded-lg bg-neutral-900"
                      />
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500 text-neutral-950 shadow-sm">
                        {sugg.score}%
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                      {sugg.item.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">{sugg.item.category} • {sugg.colorName}</p>
                    <span className="text-[9px] text-amber-400/80 font-mono block mt-1">
                      + Add to Canvas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: CLOSET SELECTOR FOR ACTIVE SLOT (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shirt className="w-4 h-4 text-amber-400" />
                <span>Available {activeSlot} ({availableForSlot.length})</span>
              </h3>
              <p className="text-[11px] text-neutral-400">Click to equip or swap piece</p>
            </div>

            <div className="flex gap-1">
              {(['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'] as ClothingCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveSlot(c)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                    activeSlot === c ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white bg-neutral-950'
                  }`}
                >
                  {c[0]}
                </button>
              ))}
            </div>
          </div>

          {/* AI Color Compatibility recommendation banner inside tab */}
          {activeAnchorItem && suggestionsForActiveSlot.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-xs">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                AI Top Ranked Match for {activeAnchorItem.color}:
              </span>
              <p className="text-[11px] text-neutral-300">
                {suggestionsForActiveSlot[0].rationale}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {availableForSlot.map((item) => {
              const isSelected = currentOutfit[slotKeyMap[item.category]]?.id === item.id;

              // Color score against anchor piece
              let score = null;
              if (activeAnchorItem && item.id !== activeAnchorItem.id) {
                score = getPairwiseColorScore(activeAnchorItem.color, item.color);
              }

              return (
                <div
                  key={item.id}
                  onClick={() => updateOutfitSelection(slotKeyMap[item.category], item)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  {score !== null && (
                    <span className="absolute top-3.5 right-3.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-950/80 backdrop-blur border border-emerald-500/40 text-emerald-300 shadow">
                      {score}%
                    </span>
                  )}

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.croppedImageUrl || item.imageUrl}
                    alt={item.name}
                    className="w-full aspect-square object-contain rounded-xl mb-2 bg-neutral-900 p-1"
                  />
                  <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full border border-neutral-700"
                        style={{ backgroundColor: item.colorHex || '#FFFFFF' }}
                      />
                      {item.color}
                    </span>
                    <span className="font-mono">{item.occasion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
