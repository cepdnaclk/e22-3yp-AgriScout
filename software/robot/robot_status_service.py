import time
import logging
import threading
from typing import Optional
from config import RobotConfig

logger = logging.getLogger(__name__)

class RobotStatusService:
    """
    Manages robot internal state, battery monitoring, and periodic heartbeats.
    """
    def __init__(self, api_client):
        self.api_client = api_client
        self.battery_level = 95
        self.current_plant_id = None
        self.status = "online"
        self._running = False
        self._thread = None

    def set_current_plant(self, plant_id: Optional[str]):
        self.current_plant_id = plant_id

    def set_status(self, status: str):
        self.status = status

    def simulate_power_drain(self):
        """Simulates battery depletion during mobile rover operation"""
        if self.battery_level > 15:
            self.battery_level -= 1

    def send_heartbeat_now(self) -> bool:
        success, res = self.api_client.send_heartbeat(
            battery_level=self.battery_level,
            status=self.status,
            current_plant=self.current_plant_id
        )
        if success:
            logger.debug(f"Heartbeat sent successfully. Battery: {self.battery_level}%")
        else:
            logger.warning(f"Heartbeat failed: {res}")
        return success

    def _heartbeat_loop(self):
        while self._running:
            self.send_heartbeat_now()
            self.simulate_power_drain()
            time.sleep(RobotConfig.HEARTBEAT_INTERVAL_SEC)

    def start_heartbeat_thread(self):
        if self._thread and self._thread.is_alive():
            return
        self._running = True
        self._thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self._thread.start()
        logger.info(f"Robot heartbeat service started (interval: {RobotConfig.HEARTBEAT_INTERVAL_SEC}s).")

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            logger.info("Robot heartbeat service stopped.")
