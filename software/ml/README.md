# AI Leaf Disease Detection Pipeline — Raspberry Pi 5 Edge Deployment

This directory contains the complete machine learning pipeline for preparing datasets, training computer vision classifiers, quantizing models, and deploying inference models to the autonomous greenhouse rover (Raspberry Pi 5).

---

## 1. Supported Disease Classes

The model classifies 10 agricultural conditions for greenhouse crops (e.g. Tomatoes, Peppers):

1. **Tomato Bacterial Spot** (*Xanthomonas perforans*)
2. **Tomato Early Blight** (*Alternaria solani*)
3. **Tomato Late Blight** (*Phytophthora infestans*)
4. **Tomato Leaf Mold** (*Passalora fulva*)
5. **Tomato Septoria Leaf Spot** (*Septoria lycopersici*)
6. **Tomato Two-Spotted Spider Mite** (*Tetranychus urticae*)
7. **Tomato Target Spot** (*Corynespora cassiicola*)
8. **Tomato Yellow Leaf Curl Virus** (*Geminiviridae*)
9. **Tomato Mosaic Virus** (*Tobamovirus*)
10. **Healthy Leaf** (Nominal baseline)

Class definitions are stored in [`classes.json`](file:///c:/Users/Suvini%20Gunawardana/OneDrive/Desktop/3yp/ml/classes.json).

---

## 2. Dataset Preparation

### Step 1: Download the Dataset
We recommend the open-access **PlantVillage Dataset** or **CrowdAI Plant Disease Challenge**:
- Kaggle: `emmarex/plantdisease` or `abdallahalshakosh/plantvillage-dataset`
- Images: RGB JPEG, 256x256 minimum resolution.

### Step 2: Organize Splits
Run the automated preparation script to organize data into 70% train, 15% validation, and 15% test splits:

```bash
python ml/dataset_prep.py --source /path/to/downloaded/dataset --output ml/processed_dataset
```

---

## 3. Model Training & Transfer Learning

We train a **MobileNetV2** backbone pretrained on ImageNet. MobileNetV2 uses inverted residual blocks and depthwise separable convolutions, making it ideal for the ARM Cortex-A76 cores on the Raspberry Pi 5.

```bash
# Install PyTorch dependencies
pip install torch torchvision torchaudio

# Run training
python ml/train.py --data ml/processed_dataset --epochs 15 --batch-size 32 --lr 0.0001 --output ml/models
```

### Training Outputs:
- PyTorch checkpoint: `ml/models/leaf_model_mobilenetv2.pth`
- Class labels mapping: `ml/models/classes.json`
- Universal ONNX model: `ml/models/leaf_model_mobilenetv2.onnx`

---

## 4. Edge Quantization for Raspberry Pi 5

Convert the ONNX model into an optimized FlatBuffer `.tflite` format:

```bash
python ml/export_tflite.py --onnx ml/models/leaf_model_mobilenetv2.onnx --output ml/models/leaf_model_mobilenetv2.tflite
```

---

## 5. Deployment to Raspberry Pi 5 Rover

1. Copy `leaf_model_mobilenetv2.tflite` and `classes.json` to the Raspberry Pi:
   ```bash
   scp ml/models/leaf_model_mobilenetv2.tflite pi@raspberrypi.local:~/robot/models/
   scp ml/classes.json pi@raspberrypi.local:~/robot/models/
   ```

2. Update `robot/.env` on the Raspberry Pi:
   ```env
   AI_MODEL_PATH=models/leaf_model_mobilenetv2.tflite
   AI_LABELS_PATH=models/classes.json
   AI_CONFIDENCE_THRESHOLD=0.65
   ```

3. Restart the robot service:
   ```bash
   sudo systemctl restart florabot.service
   ```

If no model is configured, the robot service will explicitly report:
```json
{
  "disease": "Unknown",
  "confidence": 0.0,
  "status": "not_configured",
  "message": "AI model not configured"
}
```
Inferences with confidence below `0.65` will explicitly be flagged as `uncertain`.
