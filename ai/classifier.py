import json
import logging
from pathlib import Path
from typing import Dict, Any, Union, List

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

from ai.config import (
    ARTICLE_TYPES,
    IDX_TO_ARTICLE,
    ARTICLE_METADATA,
)
from ai.train_classifier import (
    FashionClassifierModelV2,
    MODEL_SAVE_PATH,
)

logger = logging.getLogger("ClothClassifierV2")


class ClothAndAccessoryClassifier:
    """
    Identifies what cloth or accessory an image contains (based on the 25 primary
    clothing and accessory categories in the dataset).
    """

    def __init__(self, model_path: Path = MODEL_SAVE_PATH, device: str = None):
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        self.model_path = model_path
        self.classes = ARTICLE_TYPES
        self.idx_to_class = IDX_TO_ARTICLE

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        self.model = FashionClassifierModelV2(num_classes=len(self.classes), pretrained=False)

        if self.model_path.exists():
            logger.info(f"Loading trained model checkpoint from {self.model_path}...")
            state_dict = torch.load(self.model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
        else:
            logger.warning(f"No trained checkpoint at {self.model_path}, using default initialization.")

        self.model.to(self.device)
        self.model.eval()

    def identify_item(self, image_input: Union[str, Path, Image.Image]) -> Dict[str, Any]:
        """
        Predicts exactly what cloth or accessory the input image is.
        Returns:
            dict with:
            - 'article_type': dataset class (e.g. 'Shirts', 'Watches', 'Jeans')
            - 'display_name': friendly label (e.g. 'Oxford / Button-Down Shirt')
            - 'category': high-level group ('Tops', 'Bottoms', 'Shoes', 'Accessories')
            - 'item_type': 'clothing', 'footwear', or 'accessory'
            - 'confidence': prediction probability (0.0 to 1.0)
            - 'top_predictions': list of top 3 classes with probabilities
        """
        if isinstance(image_input, (str, Path)):
            pil_img = Image.open(str(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)[0].cpu().numpy()

        top_indices = probs.argsort()[::-1]
        top_predictions = []

        for idx in top_indices[:3]:
            art_name = self.idx_to_class[idx]
            meta = ARTICLE_METADATA.get(art_name, {})
            top_predictions.append({
                "article_type": art_name,
                "display_name": meta.get("display", art_name),
                "category": meta.get("category", "Clothing"),
                "probability": round(float(probs[idx]), 4),
            })

        best = top_predictions[0]
        best_article = best["article_type"]
        best_meta = ARTICLE_METADATA.get(best_article, {})

        return {
            "article_type": best_article,
            "display_name": best_meta.get("display", best_article),
            "category": best_meta.get("category", "Clothing"),
            "item_type": best_meta.get("type", "clothing"),
            "confidence": best["probability"],
            "top_predictions": top_predictions,
        }
