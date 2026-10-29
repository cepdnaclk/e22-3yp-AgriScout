import time
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from config import RobotConfig

logger = logging.getLogger(__name__)

class PlantInspectionService:
    """
    Coordinates plant inspection workflow:
    Sensor measurement -> Camera shutter -> AI classification ->
    SQLite local queue save -> Immediate upload attempt -> Flush queued records.
    """
    def __init__(
        self,
        camera_service,
        npk_sensor_service,
        leaf_detection_service,
        offline_queue,
        api_client,
        status_service
    ):
        self.camera = camera_service
        self.npk_sensor = npk_sensor_service
        self.ai = leaf_detection_service
        self.queue = offline_queue
        self.api = api_client
        self.status = status_service

    def inspect_plant(self, plant_id: str, greenhouse_id: str = RobotConfig.GREENHOUSE_ID) -> Dict[str, Any]:
        """
        Executes full inspection sequence on a visited plant.
        """
        logger.info(f"--- Starting autonomous inspection sequence for Plant: {plant_id} ---")
        self.status.set_current_plant(plant_id)
        self.status.set_status("inspecting")

        # Step 1: Generate unique inspection ID
        timestamp_iso = datetime.utcnow().isoformat() + "Z"
        inspection_id = f"INSP-{RobotConfig.ROBOT_ID}-{plant_id}-{int(time.time())}"

        # Step 2: Measure soil nutrients via Modbus RS-485
        logger.info("Probing soil nutrient values via Modbus RS-485...")
        npk_data = self.npk_sensor.read_npk_nutrients()

        # Step 3: Capture leaf image via camera
        logger.info("Capturing leaf image via camera module...")
        image_path = self.camera.capture_leaf_image(plant_id)

        # Step 4: AI Disease Inference
        logger.info("Running AI leaf disease inference...")
        ai_result = self.ai.predict_leaf_disease(image_path)

        # Step 5: Construct complete Inspection Record
        record = {
            "inspectionId": inspection_id,
            "robotId": RobotConfig.ROBOT_ID,
            "greenhouseId": greenhouse_id,
            "plantId": plant_id,
            "timestamp": timestamp_iso,
            "npkValues": npk_data,
            "soilTemperature": 22.5, # Simulated / ambient sensor
            "soilMoisture": 65.0,    # Simulated / probe
            "aiPrediction": ai_result,
            "inspectionStatus": "completed"
        }

        # Step 6: Save to local SQLite database FIRST (Offline Persistence Guarantee)
        logger.info("Saving inspection record to local SQLite offline queue...")
        self.queue.enqueue(record, image_path=image_path)

        # Step 7: Attempt immediate upload to backend
        logger.info("Attempting upload to backend API...")
        upload_success, res = self.api.upload_inspection(record, image_path=image_path)

        if upload_success:
            # Step 8: Mark record uploaded upon server confirmation
            self.queue.mark_uploaded(inspection_id)
            logger.info(f"Inspection {inspection_id} successfully stored on server.")
        else:
            # Step 9: Record upload failure in local queue for background retry
            self.queue.mark_failed(inspection_id, str(res))
            logger.warning(f"Backend unreachable or upload failed. Record preserved in local SQLite queue.")

        # Step 10: Process any backlog from previous offline periods
        self.flush_offline_queue()

        self.status.set_status("online")
        return {
            "inspectionId": inspection_id,
            "plantId": plant_id,
            "uploaded": upload_success,
            "npk": npk_data,
            "ai": ai_result
        }

    def flush_offline_queue(self, batch_size: int = 5):
        """
        Attempts to upload queued offline records that are pending retry.
        """
        pending = self.queue.get_pending_records(limit=batch_size)
        if not pending:
            return

        logger.info(f"Flushing {len(pending)} pending offline inspections...")
        for item in pending:
            insp_id = item["inspectionId"]
            self.queue.mark_uploading(insp_id)

            record_payload = {
                "inspectionId": insp_id,
                "robotId": item["robotId"],
                "greenhouseId": item["greenhouseId"],
                "plantId": item["plantId"],
                "timestamp": item["timestamp"],
                "npkValues": item["npkValues"],
                "soilTemperature": item["soilTemperature"],
                "soilMoisture": item["soilMoisture"],
                "aiPrediction": item["aiPrediction"],
                "isOfflineQueued": True,
                "retryCount": item["retryCount"]
            }

            success, res = self.api.upload_inspection(record_payload, image_path=item["imagePath"])
            if success:
                self.queue.mark_uploaded(insp_id)
                logger.info(f"Queued record {insp_id} successfully synced.")
            else:
                self.queue.mark_failed(insp_id, str(res))
                # Stop batch if network dropped
                break
