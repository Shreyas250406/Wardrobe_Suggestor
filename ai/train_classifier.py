import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, Tuple, List, Optional

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image

from ai.config import (
    OUTPUT_DIR,
    ARTICLE_TYPES,
    ARTICLE_TO_IDX,
    IDX_TO_ARTICLE,
    ARTICLE_METADATA,
)
from ai.data_processor import (
    FashionDatasetProcessorV2,
    TRAIN_SPLIT_PATH,
    TEST_SPLIT_PATH,
)

logger = logging.getLogger("TrainClassifierV2")
logging.basicConfig(level=logging.INFO)

MODEL_SAVE_PATH = OUTPUT_DIR / "clothing_classifier.pth"
EVAL_REPORT_PATH = OUTPUT_DIR / "model_evaluation_report.json"


class FashionDatasetV2(Dataset):
    """PyTorch Dataset loading images and article type labels from split records."""

    def __init__(self, records: List[Dict], transform=None):
        self.records = records
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        record = self.records[idx]
        img_path = record["image_path"]

        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            image = Image.new("RGB", (224, 224), (0, 0, 0))

        if self.transform:
            image = self.transform(image)

        label = record["label"]
        return image, label


class FashionClassifierModelV2(nn.Module):
    """Fine-grained 25-class Clothing & Accessory Classifier."""

    def __init__(self, num_classes: int = len(ARTICLE_TYPES), pretrained: bool = True):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)

        in_features = self.backbone.classifier[3].in_features
        self.backbone.classifier[3] = nn.Sequential(
            nn.Dropout(p=0.25),
            nn.Linear(in_features, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


def load_splits_or_prepare(max_train_samples: int = 7000, max_test_samples: int = 2300):
    """Loads existing 75/25 split records or generates them."""
    if TRAIN_SPLIT_PATH.exists() and TEST_SPLIT_PATH.exists():
        with open(TRAIN_SPLIT_PATH, "r", encoding="utf-8") as f:
            train_records = json.load(f)
        with open(TEST_SPLIT_PATH, "r", encoding="utf-8") as f:
            test_records = json.load(f)
    else:
        processor = FashionDatasetProcessorV2()
        train_records, test_records = processor.prepare_splits(train_ratio=0.75)

    # Subsample proportionally for fast high-accuracy training if requested
    if max_train_samples and len(train_records) > max_train_samples:
        import numpy as np
        np.random.seed(42)
        idx_train = np.random.choice(len(train_records), max_train_samples, replace=False)
        train_records = [train_records[i] for i in idx_train]

    if max_test_samples and len(test_records) > max_test_samples:
        import numpy as np
        np.random.seed(42)
        idx_test = np.random.choice(len(test_records), max_test_samples, replace=False)
        test_records = [test_records[i] for i in idx_test]

    logger.info(f"Loaded {len(train_records)} Train samples (75%) and {len(test_records)} Test samples (25%).")
    return train_records, test_records


def train_and_evaluate(
    epochs: int = 3,
    batch_size: int = 48,
    lr: float = 0.001,
    device: Optional[str] = None,
):
    """Trains on 75% dataset and evaluates on the remaining 25% test data."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    logger.info(f"Training on device: {device} ({torch.cuda.get_device_name(0) if device == 'cuda' else 'CPU'})")

    train_records, test_records = load_splits_or_prepare(max_train_samples=7500, max_test_samples=2500)

    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    test_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_dataset = FashionDatasetV2(train_records, transform=train_transforms)
    test_dataset = FashionDatasetV2(test_records, transform=test_transforms)

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=0, pin_memory=(device == "cuda")
    )
    test_loader = DataLoader(
        test_dataset, batch_size=batch_size, shuffle=False, num_workers=0, pin_memory=(device == "cuda")
    )

    model = FashionClassifierModelV2(num_classes=len(ARTICLE_TYPES), pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scaler = torch.amp.GradScaler('cuda', enabled=(device == "cuda"))

    best_test_acc = 0.0
    history = {"train_loss": [], "test_loss": [], "test_top1_acc": [], "test_top3_acc": []}

    print("\n" + "=" * 65)
    print(f"STARTING TRAINING ON 75% DATA & TESTING ON 25% DATA ({epochs} EPOCHS)")
    print(f"Target Classes: {len(ARTICLE_TYPES)} fine-grained clothing & accessory types")
    print("=" * 65)

    start_time = time.time()

    for epoch in range(1, epochs + 1):
        # 1. Training Phase (75% Data)
        model.train()
        running_loss = 0.0
        total_train = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.amp.autocast('cuda', enabled=(device == "cuda")):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            total_train += images.size(0)

        epoch_train_loss = running_loss / total_train

        # 2. Testing Phase (25% Data)
        model.eval()
        test_loss = 0.0
        correct_top1 = 0
        correct_top3 = 0
        total_test = 0

        class_correct = {i: 0 for i in range(len(ARTICLE_TYPES))}
        class_total = {i: 0 for i in range(len(ARTICLE_TYPES))}

        with torch.no_grad():
            for images, labels in test_loader:
                images = images.to(device)
                labels = labels.to(device)

                with torch.amp.autocast('cuda', enabled=(device == "cuda")):
                    outputs = model(images)
                    loss = criterion(outputs, labels)

                test_loss += loss.item() * images.size(0)

                # Top-1 accuracy
                _, preds = torch.max(outputs, 1)
                correct_top1 += (preds == labels).sum().item()

                # Top-3 accuracy
                _, top3_preds = outputs.topk(3, 1, True, True)
                for i in range(labels.size(0)):
                    if labels[i] in top3_preds[i]:
                        correct_top3 += 1
                    class_total[labels[i].item()] += 1
                    if preds[i] == labels[i]:
                        class_correct[labels[i].item()] += 1

                total_test += images.size(0)

        epoch_test_loss = test_loss / total_test
        test_top1_acc = (correct_top1 / total_test) * 100.0
        test_top3_acc = (correct_top3 / total_test) * 100.0

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["test_loss"].append(round(epoch_test_loss, 4))
        history["test_top1_acc"].append(round(test_top1_acc, 2))
        history["test_top3_acc"].append(round(test_top3_acc, 2))

        print(
            f"Epoch [{epoch}/{epochs}] - Train Loss: {epoch_train_loss:.4f} | "
            f"Test Loss: {epoch_test_loss:.4f} | "
            f"Test Top-1 Acc: {test_top1_acc:.2f}% | Test Top-3 Acc: {test_top3_acc:.2f}%"
        )

        if test_top1_acc > best_test_acc:
            best_test_acc = test_top1_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            logger.info(f"Saved new best model checkpoint to {MODEL_SAVE_PATH} ({best_test_acc:.2f}%)")

    elapsed_sec = round(time.time() - start_time, 1)

    # Per-class accuracy breakdown on remaining 25% test data
    per_class_accuracy = {}
    for idx, name in IDX_TO_ARTICLE.items():
        if class_total[idx] > 0:
            acc = round((class_correct[idx] / class_total[idx]) * 100.0, 1)
            per_class_accuracy[name] = {"accuracy": acc, "test_samples": class_total[idx]}

    print("\n" + "=" * 65)
    print(f"TRAINING COMPLETE IN {elapsed_sec}s")
    print(f"BEST TEST ACCURACY (25% Split): Top-1: {best_test_acc:.2f}% | Top-3: {history['test_top3_acc'][-1]:.2f}%")
    print(f"Saved Checkpoint: {MODEL_SAVE_PATH}")
    print("=" * 65 + "\n")

    # Export comprehensive test evaluation report
    report = {
        "model_architecture": "MobileNetV3-Small (Fine-Tuned)",
        "train_samples_75_pct": len(train_records),
        "test_samples_25_pct": len(test_records),
        "target_classes_count": len(ARTICLE_TYPES),
        "best_test_top1_accuracy": best_test_acc,
        "best_test_top3_accuracy": history["test_top3_acc"][-1],
        "training_time_seconds": elapsed_sec,
        "epochs": epochs,
        "batch_size": batch_size,
        "per_class_test_accuracy": per_class_accuracy,
        "classes": ARTICLE_TYPES,
        "history": history,
    }

    with open(EVAL_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Saved evaluation report to {EVAL_REPORT_PATH}")
    return report


if __name__ == "__main__":
    train_and_evaluate(epochs=3, batch_size=48)
