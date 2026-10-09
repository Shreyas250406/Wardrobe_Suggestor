export type ClothingCategory = 'Tops' | 'Bottoms' | 'Outerwear' | 'Shoes' | 'Accessories';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  secondaryColor?: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All-Season';
  occasion: 'Casual' | 'Smart Casual' | 'Formal' | 'Sport' | 'Party';
  style: 'Minimal' | 'Streetwear' | 'Classic' | 'Old Money' | 'Athleisure';
  imageUrl: string;
  croppedImageUrl?: string;
  brand?: string;
  wearCount: number;
  lastWornDate?: string;
  tags: string[];
  aiStatus: 'processed' | 'flagged' | 'pending';
}
