import { NextRequest, NextResponse } from 'next/server';
import { getSuggestionsForGarment, evaluateEnsembleHarmony } from '@/lib/ai/colorMatrix';
import { WardrobeItem, ClothingCategory } from '@/types/wardrobe';

export async function POST(req: NextRequest) {
  try {
    const { selectedItem, wardrobe, targetCategory, ensembleItems } = await req.json();

    if (!selectedItem) {
      return NextResponse.json({ success: false, error: 'selectedItem is required' }, { status: 400 });
    }

    const wardrobeList: WardrobeItem[] = Array.isArray(wardrobe) ? wardrobe : [];
    const suggestions = getSuggestionsForGarment(
      selectedItem as WardrobeItem,
      wardrobeList,
      targetCategory as ClothingCategory | undefined
    );

    let ensembleEvaluation = null;
    if (Array.isArray(ensembleItems) && ensembleItems.length > 0) {
      ensembleEvaluation = evaluateEnsembleHarmony(ensembleItems);
    }

    return NextResponse.json({
      success: true,
      selectedItem,
      suggestions: suggestions.slice(0, 8),
      ensembleEvaluation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
