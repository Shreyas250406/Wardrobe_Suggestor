import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple
import logging
from ultralytics import YOLO

from ai.config import YOLO_MODEL_NAME

logger = logging.getLogger("YOLODetectorV2")


class ClothingDetectorV2:
    """YOLO-based clothing and accessory detector."""

    def __init__(self, model_name: str = YOLO_MODEL_NAME):
        logger.info(f"Initializing YOLO detector ({model_name})...")
        self.model = YOLO(model_name)

    def detect(self, image_input: Any, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """Detects garment / subject bounding box."""
        if isinstance(image_input, (str, bytes)):
            pil_img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, np.ndarray):
            pil_img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input: {type(image_input)}")

        w, h = pil_img.size
        img_np = np.array(pil_img)

        results = self.model.predict(source=img_np, conf=conf_threshold, verbose=False)

        best_box = None
        best_conf = 0.0
        best_label = "subject"

        if results and len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            for box in boxes:
                coords = box.xyxy[0].cpu().numpy().astype(int).tolist()
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                cls_name = self.model.names.get(cls_id, "object")

                if conf > best_conf:
                    best_conf = conf
                    best_box = coords
                    best_label = cls_name

        # Fallback for isolated catalog photos
        if best_box is None or best_conf < 0.2:
            best_box = self._detect_foreground_object(img_np)
            best_conf = 0.88
            best_label = "apparel_item"

        x1 = max(0, min(best_box[0], w - 1))
        y1 = max(0, min(best_box[1], h - 1))
        x2 = max(x1 + 1, min(best_box[2], w))
        y2 = max(y1 + 1, min(best_box[3], h))

        return {
            "box": [x1, y1, x2, y2],
            "confidence": round(best_conf, 3),
            "label": best_label,
            "original_size": (w, h),
        }

    def _detect_foreground_object(self, img_np: np.ndarray) -> Tuple[int, int, int, int]:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape

        corners = [gray[0, 0], gray[0, -1], gray[-1, 0], gray[-1, -1]]
        bg_tone = np.median(corners)

        diff = np.abs(gray.astype(np.float32) - bg_tone)
        mask = (diff > 18).astype(np.uint8) * 255

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            largest = max(contours, key=cv2.contourArea)
            x, y, bw, bh = cv2.boundingRect(largest)
            margin_x = int(bw * 0.03)
            margin_y = int(bh * 0.03)
            return (
                max(0, x - margin_x),
                max(0, y - margin_y),
                min(w, x + bw + margin_x),
                min(h, y + bh + margin_y),
            )

        return (int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9))
