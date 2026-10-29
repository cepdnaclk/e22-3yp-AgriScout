"""
Dataset Preparation & Verification Pipeline for FloraBot
Prepares tomato and crop leaf disease datasets (e.g., PlantVillage)
into train/validation/test splits with balanced class distributions.
"""

import os
import shutil
import random
from pathlib import Path

def prepare_splits(source_dir: str, target_dir: str, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    source_path = Path(source_dir)
    target_path = Path(target_dir)

    if not source_path.exists():
        print(f"[ERROR] Source dataset directory does not exist: {source_path}")
        print("Please download the PlantVillage Tomato dataset before running prep.")
        return

    splits = ["train", "val", "test"]
    for split in splits:
        (target_path / split).mkdir(parents=True, exist_ok=True)

    classes = [d.name for d in source_path.iterdir() if d.is_dir()]
    print(f"[INFO] Found {len(classes)} class directories.")

    for cls in classes:
        cls_dir = source_path / cls
        images = [f for f in cls_dir.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png')]
        random.shuffle(images)

        n_total = len(images)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        train_imgs = images[:n_train]
        val_imgs = images[n_train:n_train + n_val]
        test_imgs = images[n_train + n_val:]

        for split_name, img_subset in zip(splits, [train_imgs, val_imgs, test_imgs]):
            split_cls_dir = target_path / split_name / cls
            split_cls_dir.mkdir(parents=True, exist_ok=True)
            for img in img_subset:
                shutil.copy2(img, split_cls_dir / img.name)

        print(f"  Class '{cls}': {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")

    print(f"[SUCCESS] Dataset organized at {target_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Organize leaf disease dataset into train/val/test splits")
    parser.add_argument("--source", type=str, default="./raw_dataset", help="Path to raw class folders")
    parser.add_argument("--output", type=str, default="./processed_dataset", help="Output path")
    args = parser.parse_args()

    prepare_splits(args.source, args.output)
