import { WardrobeItem } from './wardrobe';

export interface CurrentOutfitSelection {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  outerwear?: WardrobeItem;
  shoes?: WardrobeItem;
  accessory?: WardrobeItem;
}

export interface SavedOutfit {
  id: string;
  name: string;
  occasion: string;
  season: string;
  harmonyScore: number;
  items: WardrobeItem[];
  createdAt: string;
  notes?: string;
}
