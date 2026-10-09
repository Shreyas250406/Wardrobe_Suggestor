'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WardrobeItem } from '@/types/wardrobe';
import { SavedOutfit, CurrentOutfitSelection } from '@/types/outfit';
import { Recommendation } from '@/types/recommendation';
import { User } from '@/types/user';
import { mockUsers } from '@/data/mockUsers';

export interface DemoCredential {
  email: string;
  role: 'user' | 'admin';
  name: string;
  description: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: 'shreyasdeep253@gmail.com',
    role: 'admin',
    name: 'Shreyas Auti',
    description: 'SuperAdmin • Men\'s Capsule (12 Items)',
  },
  {
    email: 'adildeshpande05@gmail.com',
    role: 'user',
    name: 'Adil Deshpande',
    description: 'Stylist User • Men\'s Urban (12 Items)',
  },
];

interface AppContextType {
  wardrobe: WardrobeItem[];
  savedOutfits: SavedOutfit[];
  recommendations: Recommendation[];
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthLoading: boolean;
  isSupabaseConnected: boolean;
  currentOutfit: CurrentOutfitSelection;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (name: string, email: string, password?: string, role?: 'user' | 'admin') => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  switchUser: (user: User) => void;
  addWardrobeItem: (item: WardrobeItem) => Promise<void>;
  deleteWardrobeItem: (id: string) => Promise<void>;
  saveOutfit: (outfit: SavedOutfit) => void;
  deleteSavedOutfit: (id: string) => void;
  updateOutfitSelection: (slot: keyof CurrentOutfitSelection, item: WardrobeItem | undefined) => void;
  clearOutfitSelection: () => void;
  loadOutfitIntoBuilder: (items: WardrobeItem[]) => void;
  refreshWardrobe: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  const [currentOutfit, setCurrentOutfit] = useState<CurrentOutfitSelection>({
    top: undefined,
    bottom: undefined,
    outerwear: undefined,
    shoes: undefined,
    accessory: undefined,
  });

  const isAdmin = currentUser?.role === 'admin';

  // Fetch users from Supabase on mount
  useEffect(() => {
    async function loadSupabaseUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users) && data.users.length > 0) {
            setUsers(data.users);
            setIsSupabaseConnected(true);

            // Synchronize active user with Supabase ID
            setCurrentUser((prev) => {
              if (!prev) return prev;
              const match = data.users.find((u: User) => u.email.toLowerCase() === prev.email.toLowerCase());
              if (match) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('wardrobe_auth_user', JSON.stringify(match));
                }
                return match;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.warn('Could not sync users from Supabase, using local defaults', e);
      }
    }
    loadSupabaseUsers();
  }, []);

  // Hydrate session from localStorage once mounted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const isLoggedOut = localStorage.getItem('wardrobe_logged_out');
      if (isLoggedOut === 'true') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAuthLoading(false);
        return;
      }

      const savedUser = localStorage.getItem('wardrobe_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) {
          // Auto-upgrade legacy or non-existent id to Shreyas Auti
          if (
            parsed.id === 'usr-1' ||
            parsed.id === 'f9504662-17d6-4ed0-b218-5374cafcb1b3' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id)
          ) {
            parsed.id = '11111111-1111-1111-1111-111111111111';
            parsed.name = 'Shreyas Auti';
            parsed.email = 'shreyasdeep253@gmail.com';
            localStorage.setItem('wardrobe_auth_user', JSON.stringify(parsed));
          }
          setCurrentUser(parsed);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        }
      }

      // Default initial session for immediate exploration
      setCurrentUser(mockUsers[0]);
      setIsAuthenticated(true);
      localStorage.setItem('wardrobe_auth_user', JSON.stringify(mockUsers[0]));
      // Hydrate currentOutfit from localStorage if available
      try {
        const savedOutfit = localStorage.getItem('wardrobe_current_outfit');
        if (savedOutfit) {
          const parsed = JSON.parse(savedOutfit);
          if (parsed && typeof parsed === 'object') {
            setCurrentOutfit(parsed);
          }
        }
      } catch {}
    } catch {
      setCurrentUser(mockUsers[0]);
      setIsAuthenticated(true);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Fetch wardrobe from Supabase whenever currentUser changes
  const fetchWardrobeFromSupabase = async () => {
    if (!currentUser?.id) return;
    try {
      const url = currentUser.role === 'admin'
        ? '/api/wardrobe?all=true'
        : `/api/wardrobe?userId=${encodeURIComponent(currentUser.id)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setWardrobe(data.items);
          setIsSupabaseConnected(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch wardrobe from Supabase, keeping current items', e);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchWardrobeFromSupabase();
    }
  }, [currentUser?.id, currentUser?.role]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const normalized = email.trim().toLowerCase();

    try {
      // 1. Try Supabase Login API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          setIsSupabaseConnected(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem('wardrobe_auth_user', JSON.stringify(data.user));
            localStorage.setItem('wardrobe_is_authenticated', 'true');
            localStorage.removeItem('wardrobe_logged_out');
          }

          return { success: true, user: data.user };
        }
      }
    } catch (e) {
      console.warn('Supabase login API network failure, falling back to local credentials:', e);
    }

    // 2. Fallback to local users list
    let found = users.find((u) => u.email.toLowerCase() === normalized);

    if (!found) {
      if (normalized === 'shreyasdeep253@gmail.com' || normalized === 'shreyas@example.com') {
        found = mockUsers[0];
      } else if (normalized === 'adildeshpande05@gmail.com') {
        found = mockUsers[1];
      } else if (normalized === 'aryanpar03@gmail.com') {
        found = mockUsers[2];
      } else if (normalized === 'shraddha@gmail.com') {
        found = mockUsers[3];
      }
    }

    if (!found) {
      return { success: false, error: 'No account found with this email. Try demo credentials or sign up.' };
    }

    if (found.status === 'Suspended') {
      return { success: false, error: 'Account has been suspended.' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('wardrobe_auth_user', JSON.stringify(found));
      localStorage.setItem('wardrobe_is_authenticated', 'true');
      localStorage.removeItem('wardrobe_logged_out');
    }

    return { success: true, user: found };
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const normalized = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: 'Full name is required.' };
    if (!normalized.includes('@')) return { success: false, error: 'Valid email is required.' };

    try {
      // 1. Try Supabase Signup API
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: normalized, role }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const user = data.user;
          setUsers((prev) => [user, ...prev.filter((u) => u.id !== user.id)]);
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsSupabaseConnected(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem('wardrobe_auth_user', JSON.stringify(user));
            localStorage.setItem('wardrobe_is_authenticated', 'true');
            localStorage.removeItem('wardrobe_logged_out');
          }

          return { success: true, user };
        } else if (data.error) {
          return { success: false, error: data.error };
        }
      }
    } catch (e) {
      console.warn('Supabase signup API network failure, creating locally:', e);
    }

    // 2. Fallback local creation
    const exists = users.find((u) => u.email.toLowerCase() === normalized);
    if (exists) {
      return { success: false, error: 'Email is already registered. Please sign in.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role,
      wardrobeCount: 0,
      recommendationsCount: 0,
      tryOnCount: 0,
      lastActive: 'Just now',
      status: 'Active',
      joinedDate: 'Oct 2026',
      location: 'New York, USA',
      preferences: {
        preferredStyles: ['Minimal', 'Smart Casual'],
        favoriteColors: ['Black', 'White', 'Navy'],
        preferredOccasions: ['Casual', 'Smart Casual'],
        preferredSeasons: ['All-Season'],
        colorHarmonyMode: 'Neutral-Focused',
      },
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('wardrobe_auth_user', JSON.stringify(newUser));
      localStorage.setItem('wardrobe_is_authenticated', 'true');
      localStorage.removeItem('wardrobe_logged_out');
    }

    return { success: true, user: newUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('wardrobe_auth_user');
      localStorage.setItem('wardrobe_is_authenticated', 'false');
      localStorage.setItem('wardrobe_logged_out', 'true');
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardrobe_auth_user', JSON.stringify(user));
      localStorage.setItem('wardrobe_is_authenticated', 'true');
      localStorage.removeItem('wardrobe_logged_out');
    }
  };

  const addWardrobeItem = async (item: WardrobeItem) => {
    // Optimistic UI update with deduplication
    setWardrobe((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);

    // Persist to Supabase
    if (currentUser?.id) {
      try {
        const res = await fetch('/api/wardrobe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item, userId: currentUser.id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.item) {
            setWardrobe((prev) => [data.item, ...prev.filter((i) => i.id !== item.id && i.id !== data.item.id)]);
          }
        }
      } catch (e) {
        console.warn('Failed to persist wardrobe item to Supabase:', e);
      }
    }
  };

  const deleteWardrobeItem = async (id: string) => {
    setWardrobe((prev) => prev.filter((i) => i.id !== id));

    try {
      await fetch(`/api/wardrobe?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete wardrobe item from Supabase:', e);
    }
  };

  const saveOutfit = (outfit: SavedOutfit) => {
    setSavedOutfits((prev) => [outfit, ...prev]);
  };

  const deleteSavedOutfit = (id: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOutfitSelection = (slot: keyof CurrentOutfitSelection, item: WardrobeItem | undefined) => {
    setCurrentOutfit((prev) => {
      const updated = { ...prev, [slot]: item };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wardrobe_current_outfit', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const clearOutfitSelection = () => {
    const emptyOutfit: CurrentOutfitSelection = {};
    setCurrentOutfit(emptyOutfit);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('wardrobe_current_outfit');
      } catch {}
    }
  };

  const loadOutfitIntoBuilder = (items: WardrobeItem[]) => {
    const top = items.find((i) => i.category === 'Tops');
    const bottom = items.find((i) => i.category === 'Bottoms');
    const outerwear = items.find((i) => i.category === 'Outerwear');
    const shoes = items.find((i) => i.category === 'Shoes');
    const accessory = items.find((i) => i.category === 'Accessories');

    const newSelection: CurrentOutfitSelection = { top, bottom, outerwear, shoes, accessory };
    setCurrentOutfit(newSelection);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wardrobe_current_outfit', JSON.stringify(newSelection));
      } catch {}
    }
  };

  return (
    <AppContext.Provider
      value={{
        wardrobe,
        savedOutfits,
        recommendations,
        users,
        currentUser,
        isAuthenticated,
        isAdmin,
        isAuthLoading,
        isSupabaseConnected,
        currentOutfit,
        searchQuery,
        setSearchQuery,
        login,
        signup,
        logout,
        switchUser,
        addWardrobeItem,
        deleteWardrobeItem,
        saveOutfit,
        deleteSavedOutfit,
        updateOutfitSelection,
        clearOutfitSelection,
        loadOutfitIntoBuilder,
        refreshWardrobe: fetchWardrobeFromSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return ctx;
};
