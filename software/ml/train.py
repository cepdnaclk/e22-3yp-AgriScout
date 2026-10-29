"""
FloraBot AI Training Pipeline
Transfer Learning with MobileNetV2 for Edge Inference on Raspberry Pi 5.
Exports trained weights to ONNX format for quantization.
"""

import os
import json
import time
from pathlib import Path

def train_model(data_dir: str, epochs: int = 15, batch_size: int = 32, lr: float = 1e-4, output_dir: str = "./models"):
    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
        from torchvision import datasets, models, transforms
    except ImportError:
        print("[ERROR] PyTorch and TorchVision are required for model training.")
        print("Install via: pip install torch torchvision torchaudio")
        return

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Using device: {device}")

    # Data augmentations tailored for greenhouse lighting variations
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    image_datasets = {
        x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
        for x in ['train', 'val']
    }
    dataloaders = {
        x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=(x == 'train'), num_workers=2)
        for x in ['train', 'val']
    }
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    class_names = image_datasets['train'].classes
    num_classes = len(class_names)
    print(f"[INFO] Classes ({num_classes}): {class_names}")

    # Save classes.json
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    with open(out_path / "classes.json", "w") as f:
        json.dump(class_names, f, indent=2)

    # Initialize MobileNetV2 pretrained on ImageNet
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    for param in model.features.parameters():
        param.requires_grad = True # Fine-tune backbone

    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_acc = 0.0
    best_model_weights = model.state_dict()

    print("\n--- Starting Training Loop ---")
    for epoch in range(epochs):
        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == 'train':
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]
            print(f"Epoch {epoch + 1}/{epochs} [{phase}] Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_weights = model.state_dict()

    print(f"\n[SUCCESS] Best Validation Accuracy: {best_acc:.4f}")
    model.load_state_dict(best_model_weights)

    # Export PyTorch weights
    torch.save(model.state_dict(), out_path / "leaf_model_mobilenetv2.pth")

    # Export to ONNX for edge runtime on Raspberry Pi
    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    onnx_file = out_path / "leaf_model_mobilenetv2.onnx"
    torch.onnx.export(
        model,
        dummy_input,
        str(onnx_file),
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        opset_version=13
    )
    print(f"[EXPORT] ONNX model saved to: {onnx_file}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train MobileNetV2 leaf disease classifier")
    parser.add_argument("--data", type=str, default="./processed_dataset", help="Dataset directory")
    parser.add_argument("--epochs", type=int, default=10, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--output", type=str, default="./models", help="Export path")
    args = parser.parse_args()

    train_model(args.data, args.epochs, args.batch_size, args.lr, args.output)
