import pytest
import tempfile
import os
import time
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from offline_queue import OfflineQueue

@pytest.fixture
def temp_queue():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        temp_db = Path(f.name)
    queue = OfflineQueue(db_path=temp_db)
    yield queue
    if temp_db.exists():
        try:
            os.remove(temp_db)
        except Exception:
            pass

def test_enqueue_and_retrieve(temp_queue):
    record = {
        "inspectionId": "INSP-TEST-001",
        "robotId": "ROB-01",
        "greenhouseId": "GH-01",
        "plantId": "PLANT-01",
        "npkValues": {"nitrogen": 110, "phosphorus": 45, "potassium": 160, "sensorStatus": "measured"},
        "aiPrediction": {"disease": "Healthy", "confidence": 0.95}
    }

    assert temp_queue.enqueue(record) is True

    # Retrieve pending
    pending = temp_queue.get_pending_records()
    assert len(pending) == 1
    assert pending[0]["inspectionId"] == "INSP-TEST-001"
    assert pending[0]["npkValues"]["nitrogen"] == 110

def test_prevent_duplicate_enqueue(temp_queue):
    record = {
        "inspectionId": "INSP-TEST-DUP",
        "robotId": "ROB-01",
        "greenhouseId": "GH-01",
        "plantId": "PLANT-01"
    }

    assert temp_queue.enqueue(record) is True
    # Second enqueue with same inspectionId should return False
    assert temp_queue.enqueue(record) is False

def test_mark_uploaded(temp_queue):
    record = {
        "inspectionId": "INSP-TEST-UPLOAD",
        "robotId": "ROB-01",
        "greenhouseId": "GH-01",
        "plantId": "PLANT-01"
    }
    temp_queue.enqueue(record)
    temp_queue.mark_uploaded("INSP-TEST-UPLOAD")

    # Should no longer be in pending
    pending = temp_queue.get_pending_records()
    assert len(pending) == 0

    stats = temp_queue.get_queue_stats()
    assert stats["uploaded"] == 1

def test_exponential_backoff_on_failure(temp_queue):
    record = {
        "inspectionId": "INSP-FAIL",
        "robotId": "ROB-01",
        "greenhouseId": "GH-01",
        "plantId": "PLANT-01"
    }
    temp_queue.enqueue(record)
    temp_queue.mark_failed("INSP-FAIL", "Connection refused")

    # Since backoff next_retry_at is in the future, should not be immediately available
    pending = temp_queue.get_pending_records()
    assert len(pending) == 0

    stats = temp_queue.get_queue_stats()
    assert stats["failed"] == 1
