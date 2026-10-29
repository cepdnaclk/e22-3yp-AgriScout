import os
import json
import logging
import requests
from typing import Dict, Any, Tuple, Optional
from config import RobotConfig

logger = logging.getLogger(__name__)

class ApiClient:
    """
    HTTP REST client for communication between Raspberry Pi and backend.
    Sends heartbeats, diagnostics, and multipart inspection uploads.
    """
    def __init__(
        self,
        base_url: str = RobotConfig.BACKEND_URL,
        robot_id: str = RobotConfig.ROBOT_ID,
        api_key: str = RobotConfig.ROBOT_API_KEY,
        timeout: float = 8.0
    ):
        self.base_url = base_url.rstrip('/')
        self.robot_id = robot_id
        self.api_key = api_key
        self.timeout = timeout

    def _get_headers(self) -> Dict[str, str]:
        return {
            "X-Robot-Id": self.robot_id,
            "X-Robot-Key": self.api_key,
            "User-Agent": f"FloraBot-Rover/{self.robot_id}"
        }

    def check_health(self) -> bool:
        """Checks if backend server is reachable"""
        try:
            res = requests.get(f"{self.base_url}/api/health", timeout=3.0)
            return res.status_code == 200
        except Exception:
            return False

    def send_heartbeat(self, battery_level: Optional[int] = None, status: str = "online", current_plant: Optional[str] = None) -> Tuple[bool, Any]:
        """
        Sends robot heartbeat to backend
        """
        url = f"{self.base_url}/api/robot/heartbeat"
        payload = {
            "robotId": self.robot_id,
            "batteryLevel": battery_level,
            "status": status,
            "currentPlantId": current_plant
        }

        try:
            res = requests.post(url, json=payload, headers=self._get_headers(), timeout=self.timeout)
            if res.status_code == 200:
                return True, res.json()
            return False, f"Server returned {res.status_code}: {res.text}"
        except requests.exceptions.RequestException as e:
            return False, f"Network connection error: {str(e)}"

    def upload_inspection(self, record: Dict[str, Any], image_path: Optional[str] = None) -> Tuple[bool, Any]:
        """
        Uploads inspection record to backend with multipart leaf image attachment.
        """
        url = f"{self.base_url}/api/inspections"
        headers = self._get_headers()

        payload = {
            "inspectionId": record["inspectionId"],
            "robotId": record["robotId"],
            "greenhouseId": record["greenhouseId"],
            "plantId": record["plantId"],
            "timestamp": record.get("timestamp"),
            "npkValues": json.dumps(record.get("npkValues", {})),
            "soilTemperature": record.get("soilTemperature"),
            "soilMoisture": record.get("soilMoisture"),
            "aiPrediction": json.dumps(record.get("aiPrediction", {})),
            "inspectionStatus": record.get("inspectionStatus", "completed"),
            "uploadMetadata": json.dumps({
                "clientTimestamp": record.get("timestamp"),
                "isOfflineQueued": record.get("isOfflineQueued", False),
                "retryCount": record.get("retryCount", 0)
            })
        }

        files = None
        opened_file = None

        if image_path and os.path.exists(image_path):
            try:
                opened_file = open(image_path, "rb")
                files = {"leafImage": (os.path.basename(image_path), opened_file, "image/jpeg")}
            except Exception as e:
                logger.warning(f"Could not open image file {image_path}: {e}")

        try:
            res = requests.post(
                url,
                data=payload,
                files=files,
                headers=headers,
                timeout=12.0
            )

            # Accept 201 Created OR 200 OK (idempotent duplicate submission)
            if res.status_code in (200, 201):
                logger.info(f"Uploaded inspection {record['inspectionId']} successfully (Status {res.status_code}).")
                return True, res.json()

            return False, f"HTTP {res.status_code}: {res.text}"
        except requests.exceptions.RequestException as e:
            return False, f"Connection failure: {str(e)}"
        finally:
            if opened_file:
                opened_file.close()

    def report_error(self, error_message: str, error_details: Optional[Dict[str, Any]] = None):
        """Reports hardware or diagnostic error to server"""
        url = f"{self.base_url}/api/robot/status"
        payload = {
            "robotId": self.robot_id,
            "errorStatus": {
                "hasError": True,
                "errorMessage": error_message,
                "errorDetails": error_details or {}
            }
        }
        try:
            requests.post(url, json=payload, headers=self._get_headers(), timeout=5.0)
        except Exception:
            pass
