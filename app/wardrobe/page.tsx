'use client';

import React, { useState } from 'react';
import { PlusCircle, Filter, Search, Shirt, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ClothingCategory } from '@/types/wardrobe';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { AddClothingModal } from '@/components/wardrobe/AddClothingModal';

export default function WardrobePage() {
  const { wardrobe, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'All'>('All');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories: (ClothingCategory | 'All')[] = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
  const occasions = ['All', 'Casual', 'Smart Casual', 'Formal', 'Sport', 'Party'];

  const filteredItems = wardrobe.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesOccasion = selectedOccasion === 'All' || item.occasion === selectedOccasion;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.style.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesOccasion && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold mb-1">
            <Shirt className="w-4 h-4" />
            <span>Digital Catalog ({wardrobe.length} items)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Wardrobe</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Organized closet repository with AI computer vision attributes and wear history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Garment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3 rounded-2xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const count = cat === 'All' ? wardrobe.length : wardrobe.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-1.5 text-[10px] font-mono ${isSelected ? 'text-neutral-600' : 'text-neutral-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Occasion & Search */}
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {occasions.map((o) => (
              <option key={o} value={o}>
                {o === 'All' ? 'All Occasions' : o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Garments Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <Shirt className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Garments Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try adjusting your category filter or search query, or add a new piece to your closet.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedOccasion('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add Modal */}
      <AddClothingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
