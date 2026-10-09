from typing import Dict, List, Tuple, Any


class ColorCompatibilityMatrixV2:
    """Color Compatibility Matrix based on fashion styling rules and color harmony."""

    PAIRWISE_SCORES: Dict[str, Dict[str, int]] = {
        "Navy Blue": {
            "White": 99,
            "Beige": 98,
            "Grey": 96,
            "Brown": 95,
            "Khaki": 96,
            "Cream": 98,
            "Silver": 92,
            "Black": 84,
            "Olive": 86,
            "Burgundy": 92,
            "Red": 88,
            "Blue": 85,
            "Yellow": 80,
            "Pink": 82,
            "Gold": 90,
            "Rust": 91,
            "Charcoal": 90,
        },
        "White": {
            "Navy Blue": 99,
            "Black": 99,
            "Grey": 96,
            "Beige": 97,
            "Brown": 94,
            "Olive": 96,
            "Blue": 95,
            "Charcoal": 98,
            "Khaki": 95,
            "Red": 90,
            "Maroon": 93,
            "Green": 92,
            "Pink": 90,
            "Silver": 90,
            "Gold": 92,
            "Rust": 92,
            "Cream": 88,
        },
        "Black": {
            "White": 99,
            "Grey": 97,
            "Charcoal": 94,
            "Beige": 95,
            "Silver": 96,
            "Red": 93,
            "Camel": 96,
            "Khaki": 92,
            "Blue": 88,
            "Olive": 88,
            "Gold": 94,
            "Brown": 78,
            "Navy Blue": 84,
            "Yellow": 82,
            "Pink": 86,
            "Purple": 82,
        },
        "Grey": {
            "White": 96,
            "Navy Blue": 96,
            "Black": 97,
            "Charcoal": 95,
            "Pink": 92,
            "Blue": 92,
            "Burgundy": 94,
            "Maroon": 93,
            "Silver": 90,
            "Beige": 86,
            "Olive": 88,
            "Teal": 91,
            "Yellow": 84,
        },
        "Beige": {
            "Navy Blue": 98,
            "White": 97,
            "Brown": 96,
            "Olive": 97,
            "Black": 95,
            "Cream": 94,
            "Khaki": 92,
            "Rust": 93,
            "Blue": 90,
            "Grey": 86,
            "Green": 90,
            "Gold": 88,
        },
        "Brown": {
            "Cream": 98,
            "Beige": 96,
            "White": 94,
            "Navy Blue": 95,
            "Olive": 94,
            "Khaki": 95,
            "Blue": 90,
            "Rust": 92,
            "Gold": 90,
            "Black": 78,
            "Grey": 80,
        },
        "Olive": {
            "Beige": 97,
            "White": 96,
            "Cream": 96,
            "Brown": 94,
            "Black": 88,
            "Navy Blue": 86,
            "Khaki": 94,
            "Grey": 88,
            "Rust": 90,
            "Orange": 82,
            "Gold": 88,
        },
        "Blue": {
            "White": 95,
            "Grey": 92,
            "Beige": 90,
            "Brown": 90,
            "Black": 88,
            "Navy Blue": 85,
            "Khaki": 90,
            "Silver": 88,
            "Yellow": 82,
            "Orange": 84,
        },
        "Charcoal": {
            "White": 98,
            "Grey": 95,
            "Black": 94,
            "Navy Blue": 90,
            "Pink": 91,
            "Burgundy": 92,
            "Silver": 92,
            "Beige": 86,
        },
        "Cream": {
            "Brown": 98,
            "Navy Blue": 98,
            "Olive": 96,
            "Beige": 94,
            "Black": 92,
            "Rust": 94,
            "Green": 92,
        },
    }

    NEUTRALS = {"Black", "White", "Grey", "Charcoal", "Navy Blue", "Beige", "Cream", "Khaki", "Silver"}

    def get_compatibility(self, color_a: str, color_b: str) -> int:
        col_a = self._normalize_color(color_a)
        col_b = self._normalize_color(color_b)

        if col_a == col_b:
            return 92 if col_a in self.NEUTRALS else 82

        if col_a in self.PAIRWISE_SCORES and col_b in self.PAIRWISE_SCORES[col_a]:
            return self.PAIRWISE_SCORES[col_a][col_b]

        if col_b in self.PAIRWISE_SCORES and col_a in self.PAIRWISE_SCORES[col_b]:
            return self.PAIRWISE_SCORES[col_b][col_a]

        if col_a in self.NEUTRALS or col_b in self.NEUTRALS:
            return 85

        return 65

    def evaluate_outfit_palette(self, colors: List[str]) -> Dict[str, Any]:
        clean_colors = [self._normalize_color(c) for c in colors if c]
        if not clean_colors:
            return {"score": 90, "harmony_type": "Neutral", "critique": "Balanced neutral foundation."}

        if len(clean_colors) == 1:
            return {
                "score": 95,
                "harmony_type": "Monochrome",
                "critique": f"Sleek monochromatic foundation anchored in {clean_colors[0]}.",
                "best_partners": self.suggest_matching_colors(clean_colors[0]),
            }

        pairwise_scores = []
        for i in range(len(clean_colors)):
            for j in range(i + 1, len(clean_colors)):
                pairwise_scores.append(self.get_compatibility(clean_colors[i], clean_colors[j]))

        avg_score = round(sum(pairwise_scores) / len(pairwise_scores)) if pairwise_scores else 85
        unique_colors = set(clean_colors)
        all_neutral = unique_colors.issubset(self.NEUTRALS)

        if all_neutral:
            harmony_type = "Classic Neutral Harmony"
            critique = f"Sophisticated balance of neutrals ({', '.join(unique_colors)}) providing a timeless aesthetic."
        elif len(unique_colors) <= 2:
            harmony_type = "Two-Tone Complementary"
            critique = f"High-contrast synergy between {' and '.join(unique_colors)}, following the classic 60-30-10 rule."
        elif "Olive" in unique_colors or "Brown" in unique_colors or "Beige" in unique_colors:
            harmony_type = "Earth Tone Synergy"
            critique = "Organic, warm earth-toned palette exuding relaxed quiet luxury."
        else:
            harmony_type = "Balanced Multi-Tone"
            critique = f"Curated color composition with {avg_score}% palette affinity."

        return {
            "score": avg_score,
            "harmony_type": harmony_type,
            "critique": critique,
            "colors_evaluated": clean_colors,
            "best_partners": self.suggest_matching_colors(clean_colors[0]),
        }

    def suggest_matching_colors(self, base_color: str, top_k: int = 4) -> List[str]:
        norm_color = self._normalize_color(base_color)
        scores = {}

        if norm_color in self.PAIRWISE_SCORES:
            scores = self.PAIRWISE_SCORES[norm_color]
        else:
            for primary, partners in self.PAIRWISE_SCORES.items():
                if norm_color in partners:
                    scores[primary] = partners[norm_color]

        if not scores:
            return ["White", "Navy Blue", "Grey", "Black"]

        sorted_matches = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [match[0] for match in sorted_matches[:top_k]]

    def _normalize_color(self, color_name: str) -> str:
        c = str(color_name).strip().title()
        if "Navy" in c:
            return "Navy Blue"
        if "Charcoal" in c or "Dark Grey" in c:
            return "Charcoal"
        if "Beige" in c or "Khaki" in c or "Tan" in c:
            return "Beige"
        if "Cream" in c or "Off White" in c:
            return "Cream"
        if "Olive" in c:
            return "Olive"
        if "Burgundy" in c or "Maroon" in c:
            return "Maroon"
        if "Grey" in c or "Gray" in c:
            return "Grey"
        return c
