import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np

from ai.config import (
    STYLES_CSV,
    IMAGES_DIR,
    OUTPUT_DIR,
    ARTICLE_TYPES,
    ARTICLE_TO_IDX,
    ARTICLE_METADATA,
)

logger = logging.getLogger("DataProcessorV2")
logging.basicConfig(level=logging.INFO)

TRAIN_SPLIT_PATH = OUTPUT_DIR / "train_split.json"
TEST_SPLIT_PATH = OUTPUT_DIR / "test_split.json"
CATALOG_PATH = OUTPUT_DIR / "catalog_index.json"


class FashionDatasetProcessorV2:
    """Preprocesses the fashion dataset and generates 75% train / 25% test splits."""

    def __init__(self, styles_path: Path = STYLES_CSV):
        self.styles_path = styles_path

    def prepare_splits(
        self,
        train_ratio: float = 0.75,
        max_samples_per_class: int = 1000,
        random_seed: int = 42,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Splits data into exactly 75% train and 25% test stratified by article type.
        """
        logger.info(f"Loading styles metadata from {self.styles_path}...")
        df = pd.read_csv(self.styles_path, on_bad_lines="skip").dropna(subset=["id", "articleType"])
        df["id"] = df["id"].astype(int)

        # Filter strictly for the 25 target clothing and accessory types
        df_filtered = df[df["articleType"].isin(ARTICLE_TYPES)].copy()
        logger.info(f"Found {len(df_filtered)} items across the 25 target clothing/accessory types.")

        train_records = []
        test_records = []
        all_catalog = []

        np.random.seed(random_seed)

        for article in ARTICLE_TYPES:
            sub_df = df_filtered[df_filtered["articleType"] == article]
            items = []

            for _, row in sub_df.iterrows():
                item_id = int(row["id"])
                img_path = IMAGES_DIR / f"{item_id}.jpg"
                if img_path.exists():
                    meta = ARTICLE_METADATA[article]
                    item_record = {
                        "id": item_id,
                        "image_path": str(img_path),
                        "articleType": article,
                        "label": ARTICLE_TO_IDX[article],
                        "display_name": meta["display"],
                        "category": meta["category"],
                        "item_type": meta["type"],
                        "product_name": str(row.get("productDisplayName", f"{article} - {row.get('baseColour', '')}")),
                        "color": str(row.get("baseColour", "Unknown")),
                        "gender": str(row.get("gender", "Unisex")),
                        "usage": str(row.get("usage", "Casual")),
                        "season": str(row.get("season", "All-Season")),
                    }
                    items.append(item_record)
                    all_catalog.append(item_record)

            # Shuffle items
            np.random.shuffle(items)

            # Cap samples per class if needed to maintain balanced training
            if max_samples_per_class and len(items) > max_samples_per_class:
                items = items[:max_samples_per_class]

            # Exactly 75% train, 25% test
            n_train = int(len(items) * train_ratio)
            class_train = items[:n_train]
            class_test = items[n_train:]

            train_records.extend(class_train)
            test_records.extend(class_test)

            logger.info(f"Class '{article}': {len(class_train)} train (75%), {len(class_test)} test (25%)")

        logger.info(
            f"Dataset Split Completed: {len(train_records)} Train Items (75%) | "
            f"{len(test_records)} Test Items (25%) across {len(ARTICLE_TYPES)} classes."
        )

        # Save to disk
        with open(TRAIN_SPLIT_PATH, "w", encoding="utf-8") as f:
            json.dump(train_records, f, indent=2)

        with open(TEST_SPLIT_PATH, "w", encoding="utf-8") as f:
            json.dump(test_records, f, indent=2)

        # Save catalog grouped by category
        catalog_by_cat: Dict[str, List[Dict[str, Any]]] = {}
        for item in all_catalog:
            cat = item["category"]
            if cat not in catalog_by_cat:
                catalog_by_cat[cat] = []
            if len(catalog_by_cat[cat]) < 800:
                catalog_by_cat[cat].append(item)

        with open(CATALOG_PATH, "w", encoding="utf-8") as f:
            json.dump(catalog_by_cat, f, indent=2)

        logger.info(f"Saved splits to {TRAIN_SPLIT_PATH} and {TEST_SPLIT_PATH}")
        return train_records, test_records


if __name__ == "__main__":
    processor = FashionDatasetProcessorV2()
    processor.prepare_splits(train_ratio=0.75, max_samples_per_class=1000)
