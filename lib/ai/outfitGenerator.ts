import { WardrobeItem } from '@/types/wardrobe';
import {
  getPairwiseColorScore,
  evaluateEnsembleHarmony,
  normalizeColorName,
} from './colorMatrix';

export interface OutfitFilterCriteria {
  occasion?: string;
  season?: string;
  harmonyMode?: string;
  style?: string;
  selectedTopId?: string;
}

export interface GeneratedEnsemble {
  id: string;
  title: string;
  occasion: string;
  season: string;
  style: string;
  harmonyScore: number;
  archetype: string;
  stylistNote: string;
  colorPalette: string[];
  top: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  outerwear?: WardrobeItem;
  accessory?: WardrobeItem;
  items: WardrobeItem[];
  colorCompatibility: {
    topBottom: number;
    topShoes: number;
    bottomShoes: number;
    overall: number;
  };
}

const NEUTRAL_COLORS = new Set([
  'White',
  'Black',
  'Grey',
  'Charcoal',
  'Navy Blue',
  'Beige',
  'Cream',
  'Brown',
  'Khaki',
  'Silver',
]);

function isNeutralColor(color: string): boolean {
  return NEUTRAL_COLORS.has(normalizeColorName(color));
}

/**
 * Generates styled outfit ensembles based on user attributes/filters.
 * Anchors each outfit around a matching Top, then applies the Color Matrix
 * to select optimal companion Bottoms, Shoes, Outerwear, and Accessories.
 */
export function generateColorMatrixOutfits(
  wardrobe: WardrobeItem[],
  filters: OutfitFilterCriteria = {}
): GeneratedEnsemble[] {
  if (!wardrobe || wardrobe.length === 0) return [];

  const {
    occasion = 'All',
    season = 'All',
    harmonyMode = 'All',
    style = 'All',
    selectedTopId = 'All',
  } = filters;

  // 1. Extract Tops from wardrobe
  const allTops = wardrobe.filter((i) => i.category === 'Tops');
  if (allTops.length === 0) {
    // If no explicit Tops in wardrobe, consider any upper piece or first item
    const fallbackTop = wardrobe[0];
    if (!fallbackTop) return [];
    allTops.push(fallbackTop);
  }

  // 2. Filter Tops based on user attributes
  let candidateTops = allTops;

  if (selectedTopId && selectedTopId !== 'All') {
    candidateTops = allTops.filter((t) => t.id === selectedTopId);
    if (candidateTops.length === 0) candidateTops = allTops;
  } else {
    // Filter by occasion
    if (occasion !== 'All') {
      const occasionFiltered = candidateTops.filter(
        (t) =>
          t.occasion?.toLowerCase() === occasion.toLowerCase() ||
          t.tags?.some((tag) => tag.toLowerCase() === occasion.toLowerCase()) ||
          t.occasion === 'Smart Casual' // Smart Casual is versatile
      );
      if (occasionFiltered.length > 0) {
        candidateTops = occasionFiltered;
      }
    }

    // Filter by season
    if (season !== 'All') {
      const seasonFiltered = candidateTops.filter(
        (t) =>
          t.season?.toLowerCase() === season.toLowerCase() ||
          t.season === 'All-Season' ||
          t.tags?.some((tag) => tag.toLowerCase() === season.toLowerCase())
      );
      if (seasonFiltered.length > 0) {
        candidateTops = seasonFiltered;
      }
    }

    // Filter by style vibe
    if (style !== 'All') {
      const styleFiltered = candidateTops.filter(
        (t) =>
          t.style?.toLowerCase() === style.toLowerCase() ||
          t.tags?.some((tag) => tag.toLowerCase() === style.toLowerCase())
      );
      if (styleFiltered.length > 0) {
        candidateTops = styleFiltered;
      }
    }
  }

  const allBottoms = wardrobe.filter((i) => i.category === 'Bottoms');
  const allShoes = wardrobe.filter((i) => i.category === 'Shoes');
  const allOuterwear = wardrobe.filter((i) => i.category === 'Outerwear');
  const allAccessories = wardrobe.filter((i) => i.category === 'Accessories');

  const ensembles: GeneratedEnsemble[] = [];

  // 3. For each selected Top, use the Color Matrix to find matching companion pieces
  candidateTops.forEach((top, index) => {
    // A. Select Bottom using Color Matrix
    let selectedBottom: WardrobeItem | undefined;
    let bestBottomScore = -1;

    allBottoms.forEach((bottom) => {
      let score = getPairwiseColorScore(top.color, bottom.color);

      // Harmony mode weighting
      const normTop = normalizeColorName(top.color);
      const normBot = normalizeColorName(bottom.color);

      if (harmonyMode === 'Monochromatic' && normTop === normBot) {
        score += 8;
      } else if (harmonyMode === 'Neutral-Focused' && isNeutralColor(top.color) && isNeutralColor(bottom.color)) {
        score += 6;
      } else if (harmonyMode === 'Contrast' && normTop !== normBot && score >= 90) {
        score += 5;
      }

      // Occasion alignment bonus
      if (occasion !== 'All' && bottom.occasion?.toLowerCase() === occasion.toLowerCase()) {
        score += 4;
      }

      if (score > bestBottomScore) {
        bestBottomScore = score;
        selectedBottom = bottom;
      }
    });

    // B. Select Shoes using Color Matrix (coordinated with both Top & Bottom)
    let selectedShoes: WardrobeItem | undefined;
    let bestShoesScore = -1;

    allShoes.forEach((shoe) => {
      const topScore = getPairwiseColorScore(top.color, shoe.color);
      const bottomScore = selectedBottom
        ? getPairwiseColorScore(selectedBottom.color, shoe.color)
        : topScore;

      let combined = Math.round(topScore * 0.45 + bottomScore * 0.55);

      // White or Black footwear provides universal anchor
      const normShoe = normalizeColorName(shoe.color);
      if (normShoe === 'White' || normShoe === 'Black') {
        combined += 3;
      }

      if (occasion !== 'All' && shoe.occasion?.toLowerCase() === occasion.toLowerCase()) {
        combined += 3;
      }

      if (combined > bestShoesScore) {
        bestShoesScore = combined;
        selectedShoes = shoe;
      }
    });

    // C. Select Outerwear (Layering piece matching the color palette)
    let selectedOuterwear: WardrobeItem | undefined;
    let bestOuterwearScore = -1;

    allOuterwear.forEach((outer) => {
      const scoreWithTop = getPairwiseColorScore(top.color, outer.color);
      const scoreWithBot = selectedBottom
        ? getPairwiseColorScore(selectedBottom.color, outer.color)
        : scoreWithTop;

      let combined = Math.round(scoreWithTop * 0.5 + scoreWithBot * 0.5);

      if (season === 'Winter' || season === 'Autumn') {
        combined += 5;
      }

      if (combined > bestOuterwearScore && combined >= 84) {
        bestOuterwearScore = combined;
        selectedOuterwear = outer;
      }
    });

    // D. Select Accessory (Accent piece)
    let selectedAccessory: WardrobeItem | undefined;
    let bestAccessoryScore = -1;

    allAccessories.forEach((acc) => {
      const scoreWithTop = getPairwiseColorScore(top.color, acc.color);
      const scoreWithShoe = selectedShoes
        ? getPairwiseColorScore(selectedShoes.color, acc.color)
        : scoreWithTop;

      const combined = Math.round(scoreWithTop * 0.5 + scoreWithShoe * 0.5);

      if (combined > bestAccessoryScore) {
        bestAccessoryScore = combined;
        selectedAccessory = acc;
      }
    });

    // Compile items list
    const ensembleItems: WardrobeItem[] = [
      top,
      selectedBottom,
      selectedShoes,
      selectedOuterwear,
      selectedAccessory,
    ].filter(Boolean) as WardrobeItem[];

    // Evaluate holistic ensemble harmony score
    const harmonyResult = evaluateEnsembleHarmony(ensembleItems);

    // Extract unique color palette
    const uniquePalette = Array.from(
      new Set(ensembleItems.map((i) => i.colorHex || '#1E293B'))
    );

    // Generate descriptive look title
    const topName = top.name.replace(/Men|Women|Kidswear/gi, '').trim();
    const bottomName = selectedBottom ? selectedBottom.name.replace(/Men|Women/gi, '').trim() : '';
    const title = bottomName
      ? `${topName} with ${bottomName}`
      : `${topName} Ensemble`;

    const topBottomCompat = selectedBottom
      ? getPairwiseColorScore(top.color, selectedBottom.color)
      : 95;
    const topShoeCompat = selectedShoes
      ? getPairwiseColorScore(top.color, selectedShoes.color)
      : 95;
    const bottomShoeCompat =
      selectedBottom && selectedShoes
        ? getPairwiseColorScore(selectedBottom.color, selectedShoes.color)
        : 95;

    ensembles.push({
      id: `ai-look-${top.id}-${index}`,
      title,
      occasion: top.occasion || occasion === 'All' ? top.occasion || 'Smart Casual' : occasion,
      season: top.season || season === 'All' ? top.season || 'All-Season' : season,
      style: top.style || style === 'All' ? top.style || 'Classic' : style,
      harmonyScore: harmonyResult.score,
      archetype: harmonyResult.archetype,
      stylistNote: harmonyResult.stylistNote,
      colorPalette: uniquePalette,
      top,
      bottom: selectedBottom,
      shoes: selectedShoes,
      outerwear: selectedOuterwear,
      accessory: selectedAccessory,
      items: ensembleItems,
      colorCompatibility: {
        topBottom: topBottomCompat,
        topShoes: topShoeCompat,
        bottomShoes: bottomShoeCompat,
        overall: harmonyResult.score,
      },
    });
  });

  // Sort ensembles by harmony score descending
  return ensembles.sort((a, b) => b.harmonyScore - a.harmonyScore);
}
