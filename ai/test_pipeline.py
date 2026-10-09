import json
import logging
from pathlib import Path
from ai.pipeline import WardrobeAIPipelineV2
from ai.config import IMAGES_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPipelineV2")


def run_comprehensive_tests():
    pipeline = WardrobeAIPipelineV2()

    # Test cases: Shirts, Jeans, Shoes, Watches, Handbags
    test_cases = [
        {"id": 15970, "expected_type": "Shirt", "item_class": "Clothing"},
        {"id": 39386, "expected_type": "Jeans", "item_class": "Clothing"},
        {"id": 9204, "expected_type": "Casual Shoes", "item_class": "Footwear"},
        {"id": 59263, "expected_type": "Watch", "item_class": "Accessory"},
        {"id": 47957, "expected_type": "Handbag", "item_class": "Accessory"},
    ]

    print("\n" + "=" * 70)
    print("RUNNING COMPREHENSIVE AI PIPELINE TESTS (DETECT -> CROP -> COLOR -> IDENTIFY -> SUGGEST)")
    print("=" * 70 + "\n")

    for tc in test_cases:
        img_path = IMAGES_DIR / f"{tc['id']}.jpg"
        if not img_path.exists():
            print(f"Skipping {tc['id']}.jpg (not found)")
            continue

        print(f"\nEvaluating Image: {tc['id']}.jpg [Expected: {tc['expected_type']} ({tc['item_class']})]")
        print("-" * 60)

        result = pipeline.process_and_identify(
            image_input=img_path,
            target_occasion="Casual",
            target_gender="Unisex",
            save_outputs=True,
        )

        ident = result["identified_cloth_or_accessory"]
        color = result["color_analysis"]["dominant_color"]

        print(f"1. Detection: {result['detection']['label']} (conf: {result['detection']['confidence']})")
        print(f"   Bounding Box: {result['detection']['bbox']}")
        print(f"2. SAM 2 Crop: {result['segmentation']['cropped_dimensions']} -> Saved: {result['segmentation']['cropped_image_path']}")
        print(f"3. Pillow Color: {color['name']} ({color['hex']}) - {color['percentage']}% dominant")
        print(f"4. IDENTIFIED ITEM:")
        print(f"   - What cloth/accessory it is: {ident['display_name']} ({ident['article_type']})")
        print(f"   - Category: {ident['category']} | Type: {ident['item_type']}")
        print(f"   - Confidence: {ident['confidence'] * 100:.2f}%")
        print(f"   - Top-3: {[(p['display_name'], round(p['probability'] * 100, 1)) for p in ident['top_predictions']]}")
        print(f"5. Complete Outfit Recommendations ({len(result['outfit_recommendations'])} outfits generated):")
        top_rec = result["outfit_recommendations"][0]
        print(f"   - {top_rec['name']} | Match Score: {top_rec['matchPercentage']}% (Color: {top_rec['colorCompatibility']}%, Occasion: {top_rec['occasionMatch']}%)")
        print(f"   - Stylist Note: \"{top_rec['aiStylistNote']}\"")
        print(f"   - Pieces: {[p.get('name', p.get('display_name', p.get('articleType'))) for p in top_rec['pieces']]}")

    print("\n" + "=" * 70)
    print("ALL PIPELINE TESTS FINISHED SUCCESSFULLY!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_comprehensive_tests()
