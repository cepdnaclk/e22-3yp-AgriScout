import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from leaf_detection_service import LeafDetectionService
from npk_sensor_service import NpkSensorService

def test_ai_service_unconfigured():
    # When no model file exists, should return not_configured
    ai = LeafDetectionService(model_path="/non_existent_model.tflite")
    result = ai.predict_leaf_disease("dummy.jpg")

    assert result["status"] == "not_configured"
    assert result["disease"] == "Unknown"
    assert result["confidence"] == 0.0
    assert "AI model not configured" in result["message"]

def test_npk_sensor_mock_output():
    sensor = NpkSensorService(mock_mode=True)
    reading = sensor.read_npk_nutrients()

    assert reading["sensorStatus"] == "measured"
    assert reading["unit"] == "mg/kg"
    assert isinstance(reading["nitrogen"], (int, float))
    assert isinstance(reading["phosphorus"], (int, float))
    assert isinstance(reading["potassium"], (int, float))
    assert "measuredAt" in reading

def test_npk_sensor_unavailable_when_unconfigured():
    # If mock_mode is False and no client connected, returns unavailable (None values, not 0)
    sensor = NpkSensorService(port="/dev/null_port", mock_mode=False)
    reading = sensor.read_npk_nutrients()

    assert reading["sensorStatus"] == "unavailable"
    assert reading["nitrogen"] is None
    assert reading["phosphorus"] is None
    assert reading["potassium"] is None
