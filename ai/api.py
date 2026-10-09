from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from PIL import Image
import io
import os
import base64
import logging

from ai.pipeline import WardrobeAIPipelineV2
from ai.color_matrix import ColorCompatibilityMatrixV2

logger = logging.getLogger("AI_API_V2")

app = FastAPI(
    title="AI Wardrobe Suggestor — Computer Vision & Styling Microservice",
    description="Identifies clothes & accessories, crops with SAM 2, extracts colors with Pillow, and recommends outfits.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline: Optional[WardrobeAIPipelineV2] = None
color_matrix = ColorCompatibilityMatrixV2()


def get_pipeline() -> WardrobeAIPipelineV2:
    global pipeline
    if pipeline is None:
        logger.info("Initializing WardrobeAIPipelineV2...")
        pipeline = WardrobeAIPipelineV2()
    return pipeline


class ColorHarmonyRequest(BaseModel):
    colors: List[str]


@app.get("/api/ai/health")
def health_check():
    return {
        "status": "healthy",
        "models": {
            "detection": "YOLO11 Nano",
            "segmentation": "SAM 2.1 Tiny",
            "color_extraction": "Pillow Quantize & K-Means",
            "classifier": "Fine-Tuned MobileNetV3 (25 Cloth & Accessory Classes)",
            "scoring": "ColorCompatibilityMatrixV2",
        },
    }


@app.post("/api/ai/process-clothing")
async def process_clothing(
    file: UploadFile = File(...),
    target_occasion: Optional[str] = Form("Casual"),
    target_gender: Optional[str] = Form("Unisex"),
):
    try:
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")

        ai_pipeline = get_pipeline()
        result = ai_pipeline.process_and_identify(
            pil_image,
            target_occasion=target_occasion,
            target_gender=target_gender,
            save_outputs=True,
        )

        cropped_path = result.get("segmentation", {}).get("cropped_image_path")
        if cropped_path and os.path.exists(cropped_path):
            with open(cropped_path, "rb") as f:
                result["segmentation"]["cropped_image_base64"] = base64.b64encode(f.read()).decode("utf-8")

        import numpy as np

        def to_serializable(val):
            if isinstance(val, dict):
                return {k: to_serializable(v) for k, v in val.items()}
            elif isinstance(val, (list, tuple)):
                return [to_serializable(v) for v in val]
            elif isinstance(val, (np.integer, np.int64, np.int32)):
                return int(val)
            elif isinstance(val, (np.floating, np.float32, np.float64)):
                return float(val)
            elif isinstance(val, np.ndarray):
                return val.tolist()
            return val

        return to_serializable(result)
    except Exception as e:
        logger.error(f"Error in process_clothing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/identify-item")
async def identify_item(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")

        ai_pipeline = get_pipeline()
        return ai_pipeline.classifier.identify_item(pil_image)
    except Exception as e:
        logger.error(f"Error in identify_item: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/color-harmony")
def evaluate_colors(request: ColorHarmonyRequest):
    return color_matrix.evaluate_outfit_palette(request.colors)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai.api:app", host="0.0.0.0", port=8001, reload=True)
