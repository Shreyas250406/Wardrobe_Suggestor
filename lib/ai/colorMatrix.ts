import { WardrobeItem, ClothingCategory } from '@/types/wardrobe';

/**
 * Color Compatibility Matrix based on fashion styling rules,
 * color harmony theory, and RANKING_MATRIX.md / ai/color_matrix.py.
 */
export const PAIRWISE_COLOR_SCORES: Record<string, Record<string, number>> = {
  'Navy Blue': {
    White: 99,
    Beige: 98,
    Grey: 96,
    Brown: 95,
    Khaki: 96,
    Cream: 98,
    Silver: 92,
    Black: 84,
    Olive: 86,
    Burgundy: 92,
    Red: 88,
    Blue: 85,
    Yellow: 80,
    Pink: 82,
    Gold: 90,
    Rust: 91,
    Charcoal: 90,
  },
  White: {
    'Navy Blue': 99,
    Black: 99,
    Grey: 96,
    Beige: 97,
    Brown: 94,
    Olive: 96,
    Blue: 95,
    Charcoal: 98,
    Khaki: 95,
    Red: 90,
    Maroon: 93,
    Green: 92,
    Pink: 90,
    Silver: 90,
    Gold: 92,
    Rust: 92,
    Cream: 88,
  },
  Black: {
    White: 99,
    Grey: 97,
    Charcoal: 94,
    Beige: 95,
    Silver: 96,
    Red: 93,
    Camel: 96,
    Khaki: 92,
    Blue: 88,
    Olive: 88,
    Gold: 94,
    Brown: 78,
    'Navy Blue': 84,
    Yellow: 82,
    Pink: 86,
    Purple: 82,
  },
  Grey: {
    White: 96,
    'Navy Blue': 96,
    Black: 97,
    Charcoal: 95,
    Pink: 92,
    Blue: 92,
    Burgundy: 94,
    Maroon: 93,
    Silver: 90,
    Beige: 86,
    Olive: 88,
    Teal: 91,
    Yellow: 84,
  },
  Beige: {
    'Navy Blue': 98,
    White: 97,
    Brown: 96,
    Olive: 97,
    Black: 95,
    Cream: 94,
    Khaki: 92,
    Rust: 93,
    Blue: 90,
    Grey: 86,
    Green: 90,
    Gold: 88,
  },
  Brown: {
    Cream: 98,
    Beige: 96,
    White: 94,
    'Navy Blue': 95,
    Olive: 94,
    Khaki: 95,
    Blue: 90,
    Gold: 92,
    Rust: 94,
    Green: 88,
    Grey: 80,
    Black: 78,
  },
  Olive: {
    Beige: 97,
    Cream: 96,
    White: 96,
    Brown: 94,
    Khaki: 94,
    Black: 88,
    'Navy Blue': 86,
    Rust: 92,
    Grey: 88,
    Gold: 90,
    Orange: 85,
  },
  Charcoal: {
    White: 98,
    Grey: 95,
    Black: 94,
    'Navy Blue': 90,
    Pink: 91,
    Burgundy: 93,
    Silver: 92,
    Beige: 86,
    Olive: 88,
    Cream: 86,
  },
  Cream: {
    Brown: 98,
    'Navy Blue': 98,
    Olive: 96,
    Beige: 94,
    Rust: 93,
    Gold: 94,
    Black: 92,
    Grey: 86,
    White: 88,
  },
  Camel: {
    Black: 96,
    White: 96,
    'Navy Blue': 95,
    Cream: 94,
    Grey: 90,
    Burgundy: 92,
  },
  Indigo: {
    White: 98,
    Grey: 96,
    Beige: 94,
    Brown: 92,
    Black: 86,
    Olive: 90,
  },
};

/**
 * Normalizes input color name to matrix anchor
 */
export function normalizeColorName(color: string): string {
  if (!color) return 'Black';
  const c = color.trim().toLowerCase();
  if (c.includes('navy')) return 'Navy Blue';
  if (c.includes('white') || c.includes('snow') || c.includes('ivory')) return 'White';
  if (c.includes('black') || c.includes('noir') || c.includes('dark')) return 'Black';
  if (c.includes('grey') || c.includes('gray') || c.includes('silver')) return 'Grey';
  if (c.includes('charcoal')) return 'Charcoal';
  if (c.includes('beige') || c.includes('tan') || c.includes('sand')) return 'Beige';
  if (c.includes('brown') || c.includes('espresso') || c.includes('chocolate')) return 'Brown';
  if (c.includes('olive') || c.includes('army') || c.includes('sage')) return 'Olive';
  if (c.includes('cream') || c.includes('off-white')) return 'Cream';
  if (c.includes('camel')) return 'Camel';
  if (c.includes('indigo') || c.includes('denim') || c.includes('blue')) return 'Navy Blue';
  return 'Navy Blue';
}

/**
 * Computes pairwise compatibility between two colors (0 - 100)
 */
export function getPairwiseColorScore(colorA: string, colorB: string): number {
  const normA = normalizeColorName(colorA);
  const normB = normalizeColorName(colorB);

  if (normA === normB) return 92; // Monochromatic / tonal baseline

  if (PAIRWISE_COLOR_SCORES[normA]?.[normB] !== undefined) {
    return PAIRWISE_COLOR_SCORES[normA][normB];
  }
  if (PAIRWISE_COLOR_SCORES[normB]?.[normA] !== undefined) {
    return PAIRWISE_COLOR_SCORES[normB][normA];
  }

  return 85; // Default neutral-pairing fallback
}

export interface ColorSuggestion {
  item: WardrobeItem;
  score: number;
  colorName: string;
  rationale: string;
  archetype: string;
}

/**
 * Given a selected garment, ranks candidate items from the wardrobe based on Color Matrix
 */
export function getSuggestionsForGarment(
  selectedItem: WardrobeItem,
  wardrobe: WardrobeItem[],
  targetCategory?: ClothingCategory
): ColorSuggestion[] {
  const candidates = wardrobe.filter((i) => {
    if (i.id === selectedItem.id) return false;
    if (targetCategory && i.category !== targetCategory) return false;
    return true;
  });

  const suggestions: ColorSuggestion[] = candidates.map((candidate) => {
    const score = getPairwiseColorScore(selectedItem.color, candidate.color);
    let rationale = 'Harmonious neutral pairing providing balanced contrast.';
    let archetype = 'Neutral Synergy';

    const normA = normalizeColorName(selectedItem.color);
    const normB = normalizeColorName(candidate.color);

    if (score >= 97) {
      rationale = `High-contrast foundation rule (${normA} + ${normB}) creates effortless classic elegance.`;
      archetype = 'Classic Neutral Harmony';
    } else if (normA === normB) {
      rationale = `Tonal monochromatic pairing creates a streamlined, modern silhouette.`;
      archetype = 'Monochromatic Elegance';
    } else if (
      ['Beige', 'Brown', 'Olive', 'Cream', 'Khaki'].includes(normA) &&
      ['Beige', 'Brown', 'Olive', 'Cream', 'Khaki'].includes(normB)
    ) {
      rationale = `Subdued earth-tone palette exudes quiet luxury and relaxed refinement.`;
      archetype = 'Earth Tone Synergy';
    } else {
      rationale = `Complementary color pairing following the 60-30 rule.`;
      archetype = 'Two-Tone Complementary';
    }

    return {
      item: candidate,
      score,
      colorName: candidate.color,
      rationale,
      archetype,
    };
  });

  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Evaluates the full ensemble color harmony score (0 - 100)
 */
export function evaluateEnsembleHarmony(items: WardrobeItem[]): {
  score: number;
  archetype: string;
  stylistNote: string;
} {
  const validItems = items.filter(Boolean);
  if (validItems.length <= 1) {
    return {
      score: 100,
      archetype: 'Single Accent',
      stylistNote: 'Select companion pieces to evaluate ensemble synergy.',
    };
  }

  let totalScore = 0;
  let comparisons = 0;

  for (let i = 0; i < validItems.length; i++) {
    for (let j = i + 1; j < validItems.length; j++) {
      totalScore += getPairwiseColorScore(validItems[i].color, validItems[j].color);
      comparisons++;
    }
  }

  const avgScore = comparisons > 0 ? Math.round(totalScore / comparisons) : 90;

  let archetype = 'Balanced Multi-Tone';
  let stylistNote = 'Curated color composition with balanced chromatic affinity.';

  if (avgScore >= 96) {
    archetype = 'Classic Neutral Harmony';
    stylistNote = 'Exceptional balance of foundational neutrals for timeless aesthetic precision.';
  } else if (avgScore >= 92) {
    archetype = 'Two-Tone Complementary';
    stylistNote = 'High-contrast synergy following the classic 60-30-10 proportions.';
  } else if (avgScore >= 88) {
    archetype = 'Earth Tone Synergy';
    stylistNote = 'Warm organic tones delivering subtle, relaxed elegance.';
  }

  return {
    score: avgScore,
    archetype,
    stylistNote,
  };
}
