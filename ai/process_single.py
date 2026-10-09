import sys
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import json
import base64
from PIL import Image

from ai.pipeline import WardrobeAIPipelineV2

import numpy as np

def serialize_obj(obj):
    if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (set, tuple)):
        return list(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def run(image_path: str, occasion: str = "Casual", gender: str = "Unisex"):
    pipeline = WardrobeAIPipelineV2()
    pil_image = Image.open(image_path).convert("RGB")
    
    result = pipeline.process_and_identify(
        pil_image,
        target_occasion=occasion,
        target_gender=gender,
        save_outputs=True
    )
    
    # Read cropped image as base64
    cropped_path = result.get("segmentation", {}).get("cropped_image_path")
    if cropped_path and Path(cropped_path).exists():
        with open(cropped_path, "rb") as f:
            result["segmentation"]["cropped_image_base64"] = base64.b64encode(f.read()).decode("utf-8")
            
    print("__JSON_START__" + json.dumps(result, default=serialize_obj) + "__JSON_END__")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_single.py <image_path> [occasion] [gender]")
        sys.exit(1)
        
    img_arg = sys.argv[1]
    occ_arg = sys.argv[2] if len(sys.argv) > 2 else "Casual"
    gen_arg = sys.argv[3] if len(sys.argv) > 3 else "Unisex"
    
    run(img_arg, occ_arg, gen_arg)
