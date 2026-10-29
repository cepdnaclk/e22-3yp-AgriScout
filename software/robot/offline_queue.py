import sqlite3
import json
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from config import RobotConfig

logger = logging.getLogger(__name__)

class OfflineQueue:
    """
    SQLite persistent storage for robot inspection records.
    Guarantees persistence across reboots, handles network disconnects,
    and implements exponential backoff retry.
    """
    def __init__(self, db_path: Path = RobotConfig.SQLITE_DB_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS offline_inspections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    inspection_id TEXT UNIQUE NOT NULL,
                    robot_id TEXT NOT NULL,
                    greenhouse_id TEXT NOT NULL,
                    plant_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    npk_json TEXT NOT NULL,
                    soil_temp REAL,
                    soil_moisture REAL,
                    image_path TEXT,
                    ai_json TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    retry_count INTEGER DEFAULT 0,
                    next_retry_at REAL DEFAULT 0,
                    last_error TEXT,
                    created_at TEXT NOT NULL,
                    uploaded_at TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON offline_inspections(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_inspection_id ON offline_inspections(inspection_id)")
            conn.commit()
            logger.info(f"SQLite offline queue initialized at {self.db_path}")

    def enqueue(self, record: Dict[str, Any], image_path: Optional[str] = None) -> bool:
        """
        Saves inspection record locally to SQLite.
        Returns True if inserted, False if duplicate.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO offline_inspections (
                        inspection_id, robot_id, greenhouse_id, plant_id, timestamp,
                        npk_json, soil_temp, soil_moisture, image_path, ai_json,
                        status, retry_count, next_retry_at, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, ?)
                """, (
                    record["inspectionId"],
                    record["robotId"],
                    record["greenhouseId"],
                    record["plantId"],
                    record.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                    json.dumps(record.get("npkValues", {})),
                    record.get("soilTemperature"),
                    record.get("soilMoisture"),
                    image_path,
                    json.dumps(record.get("aiPrediction", {})),
                    datetime.utcnow().isoformat() + "Z"
                ))
                conn.commit()
                logger.info(f"Enqueued inspection {record['inspectionId']} for Plant {record['plantId']} to SQLite.")
                return True
            except sqlite3.IntegrityError:
                logger.warning(f"Inspection {record['inspectionId']} already exists in SQLite queue. Skipping duplicate.")
                return False

    def get_pending_records(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves pending or failed inspections whose retry backoff time has elapsed.
        """
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM offline_inspections
                WHERE status IN ('pending', 'failed') AND next_retry_at <= ?
                ORDER BY id ASC LIMIT ?
            """, (now, limit))
            rows = cursor.fetchall()

            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "inspectionId": r["inspection_id"],
                    "robotId": r["robot_id"],
                    "greenhouseId": r["greenhouse_id"],
                    "plantId": r["plant_id"],
                    "timestamp": r["timestamp"],
                    "npkValues": json.loads(r["npk_json"]),
                    "soilTemperature": r["soil_temp"],
                    "soilMoisture": r["soil_moisture"],
                    "imagePath": r["image_path"],
                    "aiPrediction": json.loads(r["ai_json"]),
                    "status": r["status"],
                    "retryCount": r["retry_count"]
                })
            return results

    def mark_uploading(self, inspection_id: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE offline_inspections SET status = 'uploading' WHERE inspection_id = ?
            """, (inspection_id,))
            conn.commit()

    def mark_uploaded(self, inspection_id: str):
        """
        Marks record as uploaded upon server confirmation.
        NEVER deletes pending records prior to confirmation.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE offline_inspections 
                SET status = 'uploaded', uploaded_at = ?, last_error = NULL
                WHERE inspection_id = ?
            """, (datetime.utcnow().isoformat() + "Z", inspection_id))
            conn.commit()
            logger.info(f"Confirmed upload for inspection {inspection_id} in SQLite queue.")

    def mark_failed(self, inspection_id: str, error_message: str):
        """
        Records failure and schedules retry with exponential backoff.
        Formula: delay = min(300s, 5 * (2 ** retry_count))
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT retry_count FROM offline_inspections WHERE inspection_id = ?
            """, (inspection_id,))
            row = cursor.fetchone()
            current_retries = row["retry_count"] if row else 0
            new_retries = current_retries + 1

            # Exponential backoff (e.g. 10s, 20s, 40s, 80s, max 300s)
            delay = min(300, 5 * (2 ** min(new_retries, 6)))
            next_retry = time.time() + delay

            cursor.execute("""
                UPDATE offline_inspections
                SET status = 'failed', retry_count = ?, next_retry_at = ?, last_error = ?
                WHERE inspection_id = ?
            """, (new_retries, next_retry, str(error_message), inspection_id))
            conn.commit()
            logger.warning(f"Upload failed for {inspection_id} (retry {new_retries}): {error_message}. Next retry in {delay}s.")

    def get_queue_stats(self) -> Dict[str, int]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT status, COUNT(*) as count FROM offline_inspections GROUP BY status")
            rows = cursor.fetchall()
            stats = {"pending": 0, "uploading": 0, "uploaded": 0, "failed": 0}
            for r in rows:
                stats[r["status"]] = r["count"]
            return stats
