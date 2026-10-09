import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Optional, Union, Tuple
from pathlib import Path
import logging
from ultralytics import SAM

from ai.config import SAM_MODEL_NAME

logger = logging.getLogger("SAM2SegmenterV2")


class ClothSegmenterV2:
    """
    SAM 2-powered precision garment segmentation and white-background cropping.
    Removes human body parts (faces, heads, hands, arms, neck) and applies a clean
    studio white background to the isolated clothing item.
    """

    def __init__(self, model_name: str = SAM_MODEL_NAME):
        logger.info(f"Loading SAM 2 model ({model_name})...")
        self.model = SAM(model_name)

        # Load OpenCV Haar face detectors
        self.face_cascade = None
        self.profile_cascade = None

        face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        if Path(face_path).exists():
            self.face_cascade = cv2.CascadeClassifier(face_path)

        profile_path = cv2.data.haarcascades + "haarcascade_profileface.xml"
        if Path(profile_path).exists():
            self.profile_cascade = cv2.CascadeClassifier(profile_path)

    def segment_and_crop(
        self,
        image_input: Union[str, Path, Image.Image, np.ndarray],
        bbox: Optional[List[int]] = None,
        padding: int = 15,
    ) -> Dict[str, Any]:
        """
        Segments garment using SAM 2 with bounding box prompt, removes human faces,
        hands, and skin, and applies a clean white background to the cropped cloth.
        """
        if isinstance(image_input, (str, Path)):
            pil_img = Image.open(str(image_input)).convert("RGB")
        elif isinstance(image_input, np.ndarray):
            pil_img = Image.fromarray(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        w, h = pil_img.size
        img_np = np.array(pil_img)

        # 1. SAM 2 Initial Segmentation
        predict_kwargs = {"source": img_np, "verbose": False}
        if bbox is not None:
            predict_kwargs["bboxes"] = [bbox]
        else:
            predict_kwargs["bboxes"] = [[int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9)]]

        results = self.model.predict(**predict_kwargs)

        if not results or results[0].masks is None or len(results[0].masks.data) == 0:
            x1, y1, x2, y2 = bbox if bbox else (0, 0, w, h)
            initial_mask = np.zeros((h, w), dtype=np.uint8)
            initial_mask[y1:y2, x1:x2] = 255
        else:
            mask_tensor = results[0].masks.data[0].cpu().numpy()
            mask_uint8 = (mask_tensor > 0.5).astype(np.uint8) * 255

            if mask_uint8.shape != (h, w):
                mask_pil = Image.fromarray(mask_uint8).resize((w, h), resample=Image.Resampling.NEAREST)
                initial_mask = np.array(mask_pil)
            else:
                initial_mask = mask_uint8

        # 2. Remove Human Body Parts (Faces, Heads, Hands, Skin) & Apply White Background
        return self._remove_human_and_apply_white_bg(
            img_np=img_np,
            initial_mask=initial_mask,
            bbox=bbox,
            padding=padding,
        )

    def _remove_human_and_apply_white_bg(
        self,
        img_np: np.ndarray,
        initial_mask: np.ndarray,
        bbox: Optional[List[int]] = None,
        padding: int = 15,
    ) -> Dict[str, Any]:
        """
        Removes human faces, heads, hands, arms, and skin from the clothing mask,
        blends the isolated garment seamlessly onto a pure white background, and
        crops tightly around the cloth.
        """
        h, w = img_np.shape[:2]
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Detect Human Faces & Heads
        face_mask = np.zeros((h, w), dtype=np.uint8)
        faces = []

        if self.face_cascade:
            det_faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(45, 45))
            if len(det_faces) > 0:
                faces.extend(det_faces)

        if self.profile_cascade:
            det_profiles = self.profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(45, 45))
            if len(det_profiles) > 0:
                faces.extend(det_profiles)

        for (fx, fy, fw, fh) in faces:
            # Faces are in upper 65% of person/image
            if fy < h * 0.65:
                # Cover face, hair, and upper neck
                top = max(0, int(fy - fh * 0.45))
                bottom = min(h, int(fy + fh * 1.35))
                left = max(0, int(fx - fw * 0.25))
                right = min(w, int(fx + fw * 1.25))
                cv2.rectangle(face_mask, (left, top), (right, bottom), 255, -1)

        # 2. Detect Human Skin (Hands, Wrists, Arms, Neck, Face)
        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

        lower_ycrcb = np.array([0, 133, 77], dtype=np.uint8)
        upper_ycrcb = np.array([255, 175, 128], dtype=np.uint8)
        mask_ycrcb = cv2.inRange(ycrcb, lower_ycrcb, upper_ycrcb)

        lower_hsv = np.array([0, 28, 50], dtype=np.uint8)
        upper_hsv = np.array([25, 255, 255], dtype=np.uint8)
        mask_hsv = cv2.inRange(hsv, lower_hsv, upper_hsv)

        raw_skin = cv2.bitwise_and(mask_ycrcb, mask_hsv)

        # Safeguard for tan/beige/khaki clothing:
        # If detected skin covers > 70% of initial garment mask, it's likely a tan clothing item.
        # In that case, only remove skin near detected faces or at outer extremities.
        mask_pixels = np.sum(initial_mask > 0)
        skin_in_mask = np.sum((raw_skin > 0) & (initial_mask > 0))

        final_human_mask = face_mask.copy()

        if mask_pixels > 0 and (skin_in_mask / mask_pixels) > 0.70:
            extremity_mask = np.zeros((h, w), dtype=np.uint8)
            if len(faces) > 0:
                for (fx, fy, fw, fh) in faces:
                    cv2.circle(extremity_mask, (fx + fw // 2, fy + fh), int(fh * 1.2), 255, -1)
            # Remove skin at top 15% (neck) and bottom 10% (hands/feet)
            extremity_mask[: int(h * 0.15), :] = 255
            extremity_mask[-int(h * 0.10) :, :] = 255
            skin_to_remove = cv2.bitwise_and(raw_skin, extremity_mask)
            final_human_mask = cv2.bitwise_or(final_human_mask, skin_to_remove)
        else:
            # Dilate skin mask by 5px to eliminate edge skin fringes along wrists, fingers, neck
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            dilated_skin = cv2.dilate(raw_skin, kernel, iterations=2)
            final_human_mask = cv2.bitwise_or(final_human_mask, dilated_skin)

        # 3. Exclude Human Mask from Cloth Mask
        clean_cloth_mask = initial_mask.copy()
        clean_cloth_mask[final_human_mask > 0] = 0

        # 4. Morphological Cleaning
        clean_cloth_mask = cv2.morphologyEx(
            clean_cloth_mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        )
        clean_cloth_mask = cv2.morphologyEx(
            clean_cloth_mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        )

        # Retain primary clothing component(s)
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(clean_cloth_mask)
        if num_labels > 1:
            max_area = 0
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] > max_area:
                    max_area = stats[i, cv2.CC_STAT_AREA]

            area_thresh = max_area * 0.10
            filtered_mask = np.zeros_like(clean_cloth_mask)
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] >= area_thresh:
                    filtered_mask[labels == i] = 255
            clean_cloth_mask = filtered_mask

        # Fallback if over-clearing occurred
        if np.sum(clean_cloth_mask > 0) == 0:
            clean_cloth_mask = initial_mask.copy()
            clean_cloth_mask[face_mask > 0] = 0

        # 5. Smooth Mask Edge for Natural Anti-Aliased Blending
        alpha_smooth = cv2.GaussianBlur(clean_cloth_mask, (5, 5), 0)

        # 6. Apply Pure White Background (RGB 255, 255, 255)
        white_bg = np.full((h, w, 3), 255, dtype=np.uint8)
        alpha_norm = (alpha_smooth.astype(np.float32) / 255.0)[:, :, np.newaxis]
        composite_rgb = (
            img_np.astype(np.float32) * alpha_norm + white_bg.astype(np.float32) * (1.0 - alpha_norm)
        ).astype(np.uint8)

        # 7. Crop Tightly to Cloth
        non_zeros = np.argwhere(clean_cloth_mask > 0)
        if len(non_zeros) > 0:
            ymin, xmin = non_zeros.min(axis=0)
            ymax, xmax = non_zeros.max(axis=0)

            crop_x1 = max(0, xmin - padding)
            crop_y1 = max(0, ymin - padding)
            crop_x2 = min(w, xmax + padding)
            crop_y2 = min(h, ymax + padding)
        else:
            crop_x1, crop_y1, crop_x2, crop_y2 = bbox if bbox is not None else (0, 0, w, h)

        cropped_rgb = composite_rgb[crop_y1:crop_y2, crop_x1:crop_x2]
        cropped_alpha = alpha_smooth[crop_y1:crop_y2, crop_x1:crop_x2]
        cropped_rgba = np.dstack((cropped_rgb, cropped_alpha))

        return {
            "cropped_image": Image.fromarray(cropped_rgb, mode="RGB"),
            "cropped_image_rgba": Image.fromarray(cropped_rgba, mode="RGBA"),
            "binary_mask": Image.fromarray(clean_cloth_mask, mode="L"),
            "crop_box": (int(crop_x1), int(crop_y1), int(crop_x2), int(crop_y2)),
            "original_size": (w, h),
        }
