import { WardrobeItem } from './wardrobe';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  harmonyScore: number;
  occasion: string;
  season: string;
  items: WardrobeItem[];
  colorPalette: string[];
  stylingTips: string[];
  confidenceScore: number;
}
