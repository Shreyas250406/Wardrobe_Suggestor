from PIL import Image
import numpy as np
from typing import Dict, Any, List, Tuple
import math
from ai.config import COLOR_ANCHORS


class ColorExtractorV2:
    """Pillow-powered color detection, palette distribution, and tone extraction."""

    def __init__(self, color_anchors: Dict[str, Dict[str, Any]] = COLOR_ANCHORS):
        self.color_anchors = color_anchors

    def extract_colors(
        self,
        cropped_image: Image.Image,
        num_palette_colors: int = 4,
    ) -> Dict[str, Any]:
        """Analyzes segmented garment image to extract dominant color and palette."""
        img_rgba = cropped_image.convert("RGBA")
        np_img = np.array(img_rgba)

        r = np_img[:, :, 0]
        g = np_img[:, :, 1]
        b = np_img[:, :, 2]
        a = np_img[:, :, 3]

        # Filter transparent alpha and studio white
        valid_mask = (a > 30) & ~((r > 248) & (g > 248) & (b > 248))
        valid_pixels = np_img[valid_mask][:, :3]

        if len(valid_pixels) == 0:
            valid_pixels = np_img[:, :, :3].reshape(-1, 3)

        if len(valid_pixels) > 50000:
            indices = np.random.choice(len(valid_pixels), 50000, replace=False)
            sample_pixels = valid_pixels[indices]
        else:
            sample_pixels = valid_pixels

        sample_img = Image.fromarray(sample_pixels.reshape(-1, 1, 3).astype(np.uint8), mode="RGB")
        quantized = sample_img.quantize(colors=num_palette_colors, method=Image.Quantize.MEDIANCUT)
        palette_raw = quantized.getpalette()[: num_palette_colors * 3]
        color_counts = quantized.getcolors(maxcolors=num_palette_colors)

        palette_list = []
        total_count = sum(c[0] for c in color_counts) if color_counts else 1

        for count, idx in sorted(color_counts, key=lambda x: x[0], reverse=True):
            r_val = palette_raw[idx * 3]
            g_val = palette_raw[idx * 3 + 1]
            b_val = palette_raw[idx * 3 + 2]
            rgb = (r_val, g_val, b_val)
            hex_code = f"#{r_val:02X}{g_val:02X}{b_val:02X}"
            color_name = self._closest_color_name(rgb)
            percentage = round((count / total_count) * 100, 1)

            palette_list.append({
                "name": color_name,
                "hex": hex_code,
                "rgb": rgb,
                "percentage": percentage,
            })

        dominant = palette_list[0] if palette_list else {
            "name": "Navy Blue",
            "hex": "#1E3A8A",
            "rgb": (30, 58, 138),
            "percentage": 100.0,
        }

        avg_r = int(np.mean(sample_pixels[:, 0]))
        avg_g = int(np.mean(sample_pixels[:, 1]))
        avg_b = int(np.mean(sample_pixels[:, 2]))

        luminance = 0.2126 * avg_r + 0.7152 * avg_g + 0.0722 * avg_b
        warmth_val = avg_r - avg_b

        is_neutral = dominant["name"] in ["Black", "White", "Grey", "Navy Blue", "Charcoal", "Beige", "Cream", "Silver"]
        is_dark = luminance < 110

        return {
            "dominant_color": dominant,
            "palette": palette_list,
            "properties": {
                "luminance": round(luminance, 1),
                "is_dark": is_dark,
                "warmth": "Warm" if warmth_val > 15 else ("Cool" if warmth_val < -15 else "Neutral"),
                "is_neutral": is_neutral,
                "rgb_mean": (avg_r, avg_g, avg_b),
            },
        }

    def _closest_color_name(self, rgb: Tuple[int, int, int]) -> str:
        r, g, b = rgb

        if b > r + 12 and b >= g and (r < 75 and g < 75):
            return "Navy Blue"

        if max(r, g, b) - min(r, g, b) < 14:
            if max(r, g, b) < 40:
                return "Black"
            elif max(r, g, b) > 220:
                return "White"
            else:
                return "Grey"

        min_dist = float("inf")
        best_name = "Black"

        for name, data in self.color_anchors.items():
            tr, tg, tb = data["rgb"]
            dr = r - tr
            dg = g - tg
            db = b - tb
            dist = math.sqrt(dr * dr * 0.35 + dg * dg * 0.45 + db * db * 0.20)

            if dist < min_dist:
                min_dist = dist
                best_name = name

        return best_name
