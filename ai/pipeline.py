from pathlib import Path
from typing import Dict, Any, Optional, Union
from PIL import Image
import time
import logging

from ai.config import OUTPUT_DIR
from ai.detector import ClothingDetectorV2
from ai.segmenter import ClothSegmenterV2
from ai.color_extractor import ColorExtractorV2
from ai.classifier import ClothAndAccessoryClassifier
from ai.color_matrix import ColorCompatibilityMatrixV2
from ai.recommender import OutfitRecommenderV2

logger = logging.getLogger("WardrobeAIPipelineV2")
logging.basicConfig(level=logging.INFO)


class WardrobeAIPipelineV2:
    """
    Unified AI Pipeline:
    1. YOLO: Detects clothing / accessory bounding box.
    2. SAM 2: Crops the clothing / accessory with a transparent mask.
    3. Pillow: Extracts dominant color (name, RGB, Hex) and palette distribution.
    4. Classifier: Identifies EXACTLY what cloth or accessory it is (from the dataset).
    5. Color Matrix & Recommender: Evaluates color compatibility and suggests outfits.
    """

    def __init__(self):
        logger.info("Initializing AI Pipeline V2...")
        self.detector = ClothingDetectorV2()
        self.segmenter = ClothSegmenterV2()
        self.color_extractor = ColorExtractorV2()
        self.classifier = ClothAndAccessoryClassifier()
        self.color_matrix = ColorCompatibilityMatrixV2()
        self.recommender = OutfitRecommenderV2()
        logger.info("AI Pipeline V2 ready!")

    def process_and_identify(
        self,
        image_input: Union[str, Path, Image.Image],
        target_occasion: Optional[str] = "Casual",
        target_gender: str = "Unisex",
        save_outputs: bool = True,
    ) -> Dict[str, Any]:
        """
        Runs the full AI pipeline on an input image:
        - Detects cloth/accessory
        - Crops image with SAM 2
        - Detects color with Pillow
        - Tells what cloth / accessory it is
        - Evaluates Color Matrix and provides outfit recommendations
        """
        start_time = time.time()
        timestamp = int(start_time * 1000)

        if isinstance(image_input, (str, Path)):
            pil_image = Image.open(str(image_input)).convert("RGB")
            filename = Path(image_input).stem
        elif isinstance(image_input, Image.Image):
            pil_image = image_input.convert("RGB")
            filename = f"item_{timestamp}"
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        logger.info(f"Processing image {filename} ({pil_image.size[0]}x{pil_image.size[1]})...")

        # 1. YOLO Detection
        det_res = self.detector.detect(pil_image)
        bbox = det_res["box"]
        logger.info(f"Step 1 - Detected: {det_res['label']} (conf: {det_res['confidence']}) at {bbox}")

        # 2. SAM 2 Cropping
        seg_res = self.segmenter.segment_and_crop(pil_image, bbox=bbox)
        cropped_cloth = seg_res["cropped_image"]
        binary_mask = seg_res["binary_mask"]
        logger.info(f"Step 2 - SAM 2 Cropped Dimensions: {cropped_cloth.size}")

        cropped_path = None
        mask_path = None
        if save_outputs:
            cropped_path = str(OUTPUT_DIR / f"{filename}_cropped_{timestamp}.png")
            mask_path = str(OUTPUT_DIR / f"{filename}_mask_{timestamp}.png")
            cropped_cloth.save(cropped_path, format="PNG")
            binary_mask.save(mask_path, format="PNG")

        # 3. Pillow Color Detection
        color_data = self.color_extractor.extract_colors(cropped_cloth)
        dominant_color = color_data["dominant_color"]
        palette = color_data["palette"]
        logger.info(f"Step 3 - Pillow Color: {dominant_color['name']} ({dominant_color['hex']})")

        # 4. Tell What Cloth / Accessory It Is (Trained Neural Classifier)
        identity = self.classifier.identify_item(cropped_cloth)
        logger.info(
            f"Step 4 - Identified Item: {identity['display_name']} ({identity['article_type']}) "
            f"[Category: {identity['category']}, Type: {identity['item_type']}] with confidence {identity['confidence']:.4f}"
        )

        # 5. Suggested Partner Colors from Color Matrix
        suggested_partner_colors = self.color_matrix.suggest_matching_colors(dominant_color["name"], top_k=4)

        # Construct identified item profile
        identified_item = {
            "name": f"{dominant_color['name']} {identity['display_name']}",
            "article_type": identity["article_type"],
            "display_name": identity["display_name"],
            "category": identity["category"],
            "item_type": identity["item_type"],
            "confidence": identity["confidence"],
            "top_predictions": identity["top_predictions"],
            "color": dominant_color["name"],
            "colorHex": dominant_color["hex"],
            "gender": target_gender,
            "occasion": target_occasion,
            "cropped_image_path": cropped_path,
        }

        # 6. Complete Outfit Recommendations
        recommendations = self.recommender.recommend_outfits(
            identified_item,
            num_recommendations=3,
            target_occasion=target_occasion,
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Step 5 - Pipeline finished in {elapsed_ms} ms. Generated {len(recommendations)} outfit recommendations.")

        return {
            "status": "success",
            "processing_time_ms": elapsed_ms,
            "detection": {
                "label": det_res["label"],
                "confidence": det_res["confidence"],
                "bbox": bbox,
            },
            "segmentation": {
                "cropped_dimensions": cropped_cloth.size,
                "crop_box": seg_res["crop_box"],
                "cropped_image_path": cropped_path,
                "mask_image_path": mask_path,
            },
            "color_analysis": {
                "dominant_color": dominant_color,
                "palette": palette,
                "properties": color_data["properties"],
                "suggested_partner_colors": suggested_partner_colors,
            },
            "identified_cloth_or_accessory": identified_item,
            "outfit_recommendations": recommendations,
        }
