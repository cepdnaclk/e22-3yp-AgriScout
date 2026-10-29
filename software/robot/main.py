import time
import signal
import sys
import logging
from config import RobotConfig
from camera_service import CameraService
from npk_sensor_service import NpkSensorService
from leaf_detection_service import LeafDetectionService
from offline_queue import OfflineQueue
from api_client import ApiClient
from robot_status_service import RobotStatusService
from plant_inspection_service import PlantInspectionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("FloraBot-Main")

# Monitored greenhouse plants for autonomous tour
TARGET_PLANTS = [
    "PLANT-N1-R01-P01",
    "PLANT-N1-R01-P02",
    "PLANT-N1-R01-P03",
    "PLANT-N1-R01-P04",
    "PLANT-N1-R02-P01",
    "PLANT-N1-R02-P02"
]

class RobotController:
    def __init__(self):
        logger.info("Initializing FloraBot Robot Subsystems on Raspberry Pi 5...")

        self.api_client = ApiClient()
        self.queue = OfflineQueue()
        self.camera = CameraService()
        self.npk_sensor = NpkSensorService()
        self.ai = LeafDetectionService()
        self.status = RobotStatusService(self.api_client)
        self.inspection = PlantInspectionService(
            self.camera,
            self.npk_sensor,
            self.ai,
            self.queue,
            self.api_client,
            self.status
        )

        self._running = True

    def start(self):
        logger.info(f"FloraBot Rover '{RobotConfig.ROBOT_ID}' starting inspection loop.")
        logger.info(f"Target Greenhouse: {RobotConfig.GREENHOUSE_ID}")
        logger.info(f"Backend Endpoint: {RobotConfig.BACKEND_URL}")

        # Start periodic background heartbeat
        self.status.start_heartbeat_thread()

        # Main inspection navigation loop
        plant_idx = 0
        try:
            while self._running:
                current_plant = TARGET_PLANTS[plant_idx % len(TARGET_PLANTS)]
                logger.info(f"\n>>> Autonomous rover arrived at waypoint: {current_plant} <<<")

                # Perform inspection sequence
                result = self.inspection.inspect_plant(current_plant)
                stats = self.queue.get_queue_stats()
                logger.info(f"Inspection summary: Uploaded={result['uploaded']}, QueueStats={stats}")

                plant_idx += 1

                # Wait for next waypoint
                logger.info(f"Transit to next plant in {RobotConfig.INSPECTION_INTERVAL_SEC} seconds...")
                for _ in range(RobotConfig.INSPECTION_INTERVAL_SEC):
                    if not self._running:
                        break
                    time.sleep(1)

        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received.")
        finally:
            self.shutdown()

    def shutdown(self):
        logger.info("Shutting down robot subsystems gracefully...")
        self._running = False
        self.status.stop()
        self.camera.close()
        self.npk_sensor.close()
        logger.info("All robot subsystems terminated safely.")

def main():
    controller = RobotController()

    def handle_signal(sig, frame):
        logger.info(f"Caught signal {sig}, terminating...")
        controller.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    controller.start()

if __name__ == "__main__":
    main()
