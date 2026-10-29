import os
import json
import logging
from pathlib import Path
from typing import Dict, Any
from config import RobotConfig

logger = logging.getLogger(__name__)

class LeafDetectionService:
    """
    Standard interface for leaf disease image classification.
    Supports TFLite / ONNX runtimes on Raspberry Pi 5.
    
    Strict specification adherence:
    - If no trained model file is configured, explicitly returns 'not_configured'.
    - If prediction confidence is below threshold, explicitly returns 'uncertain'.
    - Corrupt or invalid images return 'error'.
    """
    def __init__(
        self,
        model_path: str = RobotConfig.AI_MODEL_PATH,
        labels_path: str = RobotConfig.AI_LABELS_PATH,
        confidence_threshold: float = RobotConfig.AI_CONFIDENCE_THRESHOLD
    ):
        self.model_path = model_path
        self.labels_path = labels_path
        self.threshold = confidence_threshold
        self.model_version = "none"
        self.is_configured = False
        self.labels = []
        self.interpreter = None
        self.runtime_type = None

        self._initialize_model()

    def _initialize_model(self):
        if not self.model_path or not os.path.exists(self.model_path):
            logger.info("AI Leaf Disease Detection model not configured. Operating in fallback advisory mode.")
            self.is_configured = False
            return

        try:
            # Load Class Labels
            if self.labels_path and os.path.exists(self.labels_path):
                with open(self.labels_path, 'r') as f:
                    self.labels = json.load(f)
            else:
                self.labels = [
                    "Tomato Bacterial Spot",
                    "Tomato Early Blight",
                    "Tomato Late Blight",
                    "Tomato Leaf Mold",
                    "Tomato Septoria Leaf Spot",
                    "Tomato Spider Mites",
                    "Tomato Target Spot",
                    "Tomato Yellow Leaf Curl Virus",
                    "Tomato Mosaic Virus",
                    "Healthy"
                ]

            model_ext = Path(self.model_path).suffix.lower()

            # Attempt loading TFLite
            if model_ext == ".tflite":
                try:
                    import tflite_runtime.interpreter as tflite
                    self.interpreter = tflite.Interpreter(model_path=self.model_path)
                except ImportError:
                    import tensorflow as tf
                    self.interpreter = tf.lite.Interpreter(model_path=self.model_path)

                self.interpreter.allocate_tensors()
                self.runtime_type = "tflite"
                self.model_version = f"tflite-{Path(self.model_path).stem}"
                self.is_configured = True
                logger.info(f"Loaded TFLite model from {self.model_path} with {len(self.labels)} classes.")

            # Attempt loading ONNX
            elif model_ext == ".onnx":
                import onnxruntime as ort
                self.interpreter = ort.InferenceSession(self.model_path)
                self.runtime_type = "onnx"
                self.model_version = f"onnx-{Path(self.model_path).stem}"
                self.is_configured = True
                logger.info(f"Loaded ONNX model from {self.model_path}.")

            else:
                logger.warning(f"Unsupported model format: {model_ext}")
                self.is_configured = False

        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            self.is_configured = False

    def predict_leaf_disease(self, image_path: str) -> Dict[str, Any]:
        """
        Runs image classification inference on a leaf image.
        """
        # 1. Check if model is configured
        if not self.is_configured:
            return {
                "disease": "Unknown",
                "confidence": 0.0,
                "modelVersion": "none",
                "status": "not_configured",
                "message": "AI model not configured. See ml/README.md for dataset preparation and training instructions."
            }

        # 2. Check if image file exists
        if not image_path or not os.path.exists(image_path):
            return {
                "disease": "Unknown",
                "confidence": 0.0,
                "modelVersion": self.model_version,
                "status": "error",
                "message": f"Image file not found: {image_path}"
            }

        # 3. Preprocess image
        try:
            from PIL import Image
            import numpy as np

            img = Image.open(image_path).convert("RGB")
            img = img.resize((224, 224))
            img_array = np.array(img, dtype=np.float32) / 255.0
            input_tensor = np.expand_dims(img_array, axis=0)

            # 4. Inference execution
            if self.runtime_type == "tflite":
                input_details = self.interpreter.get_input_details()
                output_details = self.interpreter.get_output_details()
                self.interpreter.set_tensor(input_details[0]['index'], input_tensor)
                self.interpreter.invoke()
                predictions = self.interpreter.get_tensor(output_details[0]['index'])[0]

            elif self.runtime_type == "onnx":
                input_name = self.interpreter.get_inputs()[0].name
                predictions = self.interpreter.run(None, {input_name: input_tensor})[0][0]

            else:
                return {
                    "disease": "Unknown",
                    "confidence": 0.0,
                    "modelVersion": self.model_version,
                    "status": "error",
                    "message": "No active runtime"
                }

            # 5. Extract top confidence
            top_index = int(np.argmax(predictions))
            confidence = float(predictions[top_index])
            disease_name = self.labels[top_index] if top_index < len(self.labels) else f"Class_{top_index}"

            # 6. Uncertain / Low Confidence Handling
            if confidence < self.threshold:
                return {
                    "disease": "Uncertain / Low Confidence",
                    "confidence": confidence,
                    "modelVersion": self.model_version,
                    "status": "uncertain",
                    "rawPredictedClass": disease_name,
                    "message": f"Prediction confidence ({confidence:.2f}) below threshold ({self.threshold:.2f})"
                }

            return {
                "disease": disease_name,
                "confidence": confidence,
                "modelVersion": self.model_version,
                "status": "detected"
            }

        except Exception as e:
            logger.error(f"Inference error on {image_path}: {e}")
            return {
                "disease": "Unknown",
                "confidence": 0.0,
                "modelVersion": self.model_version,
                "status": "error",
                "message": f"Invalid image or inference failure: {str(e)}"
            }
