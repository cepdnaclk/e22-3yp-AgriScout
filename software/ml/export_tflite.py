"""
Quantization & TFLite Model Exporter for Raspberry Pi 5
Converts trained PyTorch/ONNX models into optimized FlatBuffer .tflite format
with INT8 or FP16 post-training quantization.
"""

import sys
from pathlib import Path

def export_tflite(onnx_path: str, output_tflite_path: str):
    try:
        import onnx
        from onnx_tf.backend import prepare
        import tensorflow as tf
    except ImportError:
        print("[NOTICE] To run TFLite conversion, install onnx, onnx-tf, and tensorflow:")
        print("pip install onnx onnx-tf tensorflow")
        return

    print(f"[INFO] Loading ONNX model from: {onnx_path}")
    onnx_model = onnx.load(onnx_path)
    tf_rep = prepare(onnx_model)
    tf_saved_model_dir = Path("./models/tf_saved_model")
    tf_rep.export_graph(str(tf_saved_model_dir))

    # Convert to TFLite with FP16 quantization for edge acceleration
    converter = tf.lite.TFLiteConverter.from_saved_model(str(tf_saved_model_dir))
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    tflite_model = converter.convert()

    with open(output_tflite_path, "wb") as f:
        f.write(tflite_model)

    print(f"[SUCCESS] Exported quantized TFLite model to: {output_tflite_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Convert ONNX model to TFLite for Raspberry Pi 5")
    parser.add_argument("--onnx", type=str, default="./models/leaf_model_mobilenetv2.onnx")
    parser.add_argument("--output", type=str, default="./models/leaf_model_mobilenetv2.tflite")
    args = parser.parse_args()

    export_tflite(args.onnx, args.output)
