from typing import Dict, List, Any, Optional
import json
import random
from pathlib import Path
import logging

from ai.config import OUTPUT_DIR
from ai.color_matrix import ColorCompatibilityMatrixV2
from ai.data_processor import CATALOG_PATH, FashionDatasetProcessorV2

logger = logging.getLogger("RecommenderV2")


class OutfitRecommenderV2:
    """Generates complete outfit recommendations based on the identified cloth or accessory."""

    def __init__(self, catalog_path: Path = CATALOG_PATH):
        self.color_matrix = ColorCompatibilityMatrixV2()
        self.catalog = self._load_catalog(catalog_path)

    def _load_catalog(self, catalog_path: Path) -> Dict[str, List[Dict[str, Any]]]:
        if catalog_path.exists():
            try:
                with open(catalog_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load {catalog_path}: {e}")

        logger.info("Initializing catalog from data processor...")
        processor = FashionDatasetProcessorV2()
        processor.prepare_splits()
        with open(catalog_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def recommend_outfits(
        self,
        anchor_item: Dict[str, Any],
        num_recommendations: int = 3,
        target_occasion: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Builds complete outfits centered around the identified cloth or accessory.
        """
        category = anchor_item.get("category", "Tops")
        base_color = anchor_item.get("color", "Navy Blue")
        gender = anchor_item.get("gender", "Men")
        occasion = target_occasion or anchor_item.get("occasion", "Casual")

        # Define needed slots
        if category == "Tops":
            slots_needed = ["Bottoms", "Shoes", "Accessories", "Outerwear"]
        elif category == "Bottoms":
            slots_needed = ["Tops", "Shoes", "Outerwear", "Accessories"]
        elif category == "Outerwear":
            slots_needed = ["Tops", "Bottoms", "Shoes", "Accessories"]
        elif category == "Shoes":
            slots_needed = ["Tops", "Bottoms", "Accessories", "Outerwear"]
        elif category == "Accessories":
            slots_needed = ["Tops", "Bottoms", "Shoes", "Outerwear"]
        elif category == "One-Piece":
            slots_needed = ["Shoes", "Accessories", "Outerwear"]
        else:
            slots_needed = ["Tops", "Bottoms", "Shoes"]

        suggested_colors = self.color_matrix.suggest_matching_colors(base_color, top_k=5)
        outfits = []

        for idx in range(num_recommendations):
            primary_partner = suggested_colors[idx % len(suggested_colors)]
            outfit_pieces = [anchor_item]
            outfit_colors = [base_color]

            for slot in slots_needed:
                candidates = self.catalog.get(slot, [])
                matching = [
                    it for it in candidates
                    if (gender == "Unisex" or it.get("gender") in [gender, "Unisex"])
                ] or candidates

                if not matching:
                    continue

                color_filtered = [
                    it for it in matching
                    if any(c.lower() in it.get("color", "").lower() for c in [primary_partner, "White", "Black", "Grey"])
                ]

                selected = random.choice(color_filtered) if color_filtered else random.choice(matching)
                outfit_pieces.append(selected)
                outfit_colors.append(selected.get("color", "Neutral"))

            palette_eval = self.color_matrix.evaluate_outfit_palette(outfit_colors)
            color_score = palette_eval["score"]
            occasion_scores = [95 if it.get("usage", it.get("occasion")) == occasion else 86 for it in outfit_pieces]
            occ_score = round(sum(occasion_scores) / len(occasion_scores))
            total_match = round(color_score * 0.6 + occ_score * 0.4)

            # AI Stylist Note
            other_pieces = [p for p in outfit_pieces if p != anchor_item]
            names_summary = [f"{p.get('color', '')} {p.get('display_name', p.get('subcategory', p.get('category')))}" for p in other_pieces[:2]]

            ai_note = (
                f"Anchored by the {anchor_item.get('display_name', anchor_item.get('name'))} in {base_color}, "
                f"this ensemble coordinates with {', '.join(names_summary)}. {palette_eval['critique']}"
            )

            outfits.append({
                "id": f"outfit-rec-{idx + 1}",
                "name": f"{occasion} {palette_eval['harmony_type']}",
                "matchPercentage": total_match,
                "colorCompatibility": color_score,
                "occasionMatch": occ_score,
                "harmonyType": palette_eval["harmony_type"],
                "occasion": occasion,
                "anchorItem": anchor_item,
                "pieces": outfit_pieces,
                "colors": outfit_colors,
                "aiStylistNote": ai_note,
            })

        outfits.sort(key=lambda x: x["matchPercentage"], reverse=True)
        return outfits
