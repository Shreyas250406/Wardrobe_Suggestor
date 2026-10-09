export interface UserPreferences {
  preferredStyles: string[];
  favoriteColors: string[];
  preferredOccasions: string[];
  preferredSeasons: string[];
  colorHarmonyMode: 'Monochromatic' | 'Complementary' | 'Neutral-Focused' | 'Contrast';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  wardrobeCount: number;
  recommendationsCount: number;
  tryOnCount: number;
  lastActive: string;
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  location: string;
  preferences: UserPreferences;
}
