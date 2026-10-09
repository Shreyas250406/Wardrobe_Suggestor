import { User } from '@/types/user';
import { WardrobeItem, ClothingCategory } from '@/types/wardrobe';

export interface DbUser {
  id: string;
  email: string;
  password_hash?: string | null;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string | null;
  gender_preference?: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCloth {
  id: string;
  user_id: string;
  gender: string;
  master_category: string;
  sub_category: string;
  article_type: string;
  base_colour: string;
  season: string;
  year?: number | null;
  usage_type: string;
  product_display_name: string;
  s3_bucket: string;
  s3_key: string;
  s3_image_url: string;
  s3_cropped_key?: string | null;
  s3_cropped_url?: string | null;
  color_hex?: string | null;
  material?: string | null;
  pattern?: string | null;
  style_aesthetic?: string | null;
  ai_tags?: string[] | null;
  ai_status: 'processed' | 'flagged' | 'pending';
  usage_count: number;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export function mapDbUserToUser(db: DbUser): User {
  return {
    id: db.id,
    name: db.full_name,
    email: db.email,
    avatar:
      db.avatar_url ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: db.role,
    wardrobeCount: 0,
    recommendationsCount: 15,
    tryOnCount: 10,
    lastActive: db.last_login_at ? 'Recently' : 'Just now',
    status: db.is_active ? 'Active' : 'Suspended',
    joinedDate: new Date(db.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    location: 'Global',
    preferences: {
      preferredStyles: ['Minimal', 'Smart Casual', 'Classic'],
      favoriteColors: ['Navy', 'White', 'Black'],
      preferredOccasions: ['Casual', 'Smart Casual'],
      preferredSeasons: ['All-Season'],
      colorHarmonyMode: 'Neutral-Focused',
    },
  };
}

export function mapDbClothToWardrobeItem(db: DbCloth): WardrobeItem {
  let category: ClothingCategory = 'Tops';
  const sub = (db.sub_category || '').toLowerCase();
  const master = (db.master_category || '').toLowerCase();
  const article = (db.article_type || '').toLowerCase();

  if (
    sub.includes('top') ||
    article.includes('shirt') ||
    article.includes('tshirt') ||
    article.includes('sweater') ||
    article.includes('kurta')
  ) {
    category = 'Tops';
  } else if (
    sub.includes('bottom') ||
    article.includes('jean') ||
    article.includes('trouser') ||
    article.includes('pant') ||
    article.includes('shorts')
  ) {
    category = 'Bottoms';
  } else if (
    sub.includes('outer') ||
    article.includes('coat') ||
    article.includes('jacket') ||
    article.includes('blazer')
  ) {
    category = 'Outerwear';
  } else if (
    master.includes('footwear') ||
    sub.includes('shoe') ||
    article.includes('shoe') ||
    article.includes('boot') ||
    article.includes('sneaker')
  ) {
    category = 'Shoes';
  } else {
    category = 'Accessories';
  }

  let season: WardrobeItem['season'] = 'All-Season';
  const s = (db.season || '').toLowerCase();
  if (s.includes('summer')) season = 'Summer';
  else if (s.includes('winter')) season = 'Winter';
  else if (s.includes('spring')) season = 'Spring';
  else if (s.includes('fall') || s.includes('autumn')) season = 'Autumn';

  let occasion: WardrobeItem['occasion'] = 'Casual';
  const occ = (db.usage_type || '').toLowerCase();
  if (occ.includes('formal')) occasion = 'Formal';
  else if (occ.includes('smart')) occasion = 'Smart Casual';
  else if (occ.includes('sport')) occasion = 'Sport';
  else if (occ.includes('party')) occasion = 'Party';

  let style: WardrobeItem['style'] = 'Classic';
  const st = (db.style_aesthetic || '').toLowerCase();
  if (st.includes('minimal')) style = 'Minimal';
  else if (st.includes('street')) style = 'Streetwear';
  else if (st.includes('money')) style = 'Old Money';
  else if (st.includes('athleis')) style = 'Athleisure';

  return {
    id: db.id,
    name: db.product_display_name,
    category,
    color: db.base_colour || 'Black',
    colorHex: db.color_hex || '#1E293B',
    season,
    occasion,
    style,
    brand: db.material || 'Studio Atelier',
    imageUrl: db.s3_image_url,
    croppedImageUrl: db.s3_cropped_url || undefined,
    wearCount: db.usage_count || 0,
    tags: Array.isArray(db.ai_tags) ? db.ai_tags : [category, occasion, season],
    aiStatus: db.ai_status || 'processed',
  };
}

export function mapWardrobeItemToDbCloth(
  item: WardrobeItem,
  userId: string
): Omit<DbCloth, 'id' | 'created_at' | 'updated_at'> & { id?: string } {
  let master = 'Apparel';
  let sub = 'Topwear';
  let article = 'Shirts';

  switch (item.category) {
    case 'Tops':
      master = 'Apparel';
      sub = 'Topwear';
      article = 'Shirts';
      break;
    case 'Bottoms':
      master = 'Apparel';
      sub = 'Bottomwear';
      article = 'Trousers';
      break;
    case 'Outerwear':
      master = 'Apparel';
      sub = 'Outerwear';
      article = 'Jackets';
      break;
    case 'Shoes':
      master = 'Footwear';
      sub = 'Shoes';
      article = 'Shoes';
      break;
    case 'Accessories':
      master = 'Accessories';
      sub = 'Accessories';
      article = 'Accessories';
      break;
  }

  const itemId = item.id.startsWith('item-') ? undefined : item.id;

  return {
    ...(itemId ? { id: itemId } : {}),
    user_id: userId,
    gender: 'Unisex',
    master_category: master,
    sub_category: sub,
    article_type: article,
    base_colour: item.color,
    season: item.season,
    usage_type: item.occasion,
    product_display_name: item.name,
    s3_bucket: 'wardrobe-user-clothes',
    s3_key: `users/${userId}/clothes/${item.id}/raw.jpg`,
    s3_image_url: item.imageUrl,
    s3_cropped_url: item.croppedImageUrl || null,
    color_hex: item.colorHex,
    material: item.brand || 'Cotton',
    pattern: 'Solid',
    style_aesthetic: item.style,
    ai_tags: item.tags,
    ai_status: item.aiStatus || 'processed',
    usage_count: item.wearCount || 0,
    is_favorite: false,
  };
}
