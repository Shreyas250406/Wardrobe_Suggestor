'use client';

import React from 'react';
import { WardrobeItem } from '@/types/wardrobe';
import { Trash2, Sparkles, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ClothingCardProps {
  item: WardrobeItem;
  onSelect?: (item: WardrobeItem) => void;
  selectable?: boolean;
  isSelected?: boolean;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onSelect,
  selectable = false,
  isSelected = false,
}) => {
  const { deleteWardrobeItem, updateOutfitSelection } = useApp();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slotMap: Record<string, 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory'> = {
      Tops: 'top',
      Bottoms: 'bottom',
      Outerwear: 'outerwear',
      Shoes: 'shoes',
      Accessories: 'accessory',
    };
    const slot = slotMap[item.category];
    if (slot) {
      updateOutfitSelection(slot, item);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`group relative rounded-2xl bg-neutral-900 border overflow-hidden transition-all duration-300 flex flex-col ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-950/40'
          : 'border-neutral-800 hover:border-neutral-700 hover:shadow-xl'
      } ${selectable ? 'cursor-pointer' : ''}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-neutral-950/85 backdrop-blur-md text-[10px] font-mono font-semibold text-neutral-200 border border-neutral-800">
          {item.category}
        </span>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteWardrobeItem(item.id);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-neutral-950/80 backdrop-blur-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Quick Builder Add Floating Action */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-amber-300"
          title="Load into Outfit Builder"
        >
          <Plus className="w-3 h-3" />
          <span>Add to Look</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-neutral-700 shrink-0"
              style={{ backgroundColor: item.colorHex }}
              title={item.color}
            />
            <span className="text-[11px] text-neutral-400 font-medium truncate">{item.color}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-[11px] text-neutral-400 font-medium truncate">{item.occasion}</span>
          </div>

          <h3 className="font-semibold text-xs text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
            {item.name}
          </h3>
        </div>

        <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span>{item.brand || 'Unbranded'}</span>
          <span>Worn {item.wearCount}x</span>
        </div>
      </div>
    </div>
  );
};
