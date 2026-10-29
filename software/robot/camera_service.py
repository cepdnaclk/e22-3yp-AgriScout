import time
import logging
from pathlib import Path
from datetime import datetime
from config import RobotConfig

logger = logging.getLogger(__name__)

class CameraService:
    """
    Manages Raspberry Pi Camera module captures using Picamera2.
    Provides graceful mock/software emulation when running off-Pi.
    """
    def __init__(self, output_dir: Path = RobotConfig.IMAGE_STORAGE_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.picam2 = None
        self.hardware_available = False

        if not RobotConfig.MOCK_HARDWARE:
            try:
                from picamera2 import Picamera2
                self.picam2 = Picamera2()
                camera_config = self.picam2.create_still_configuration(
                    main={"size": (RobotConfig.CAMERA_WIDTH, RobotConfig.CAMERA_HEIGHT)}
                )
                self.picam2.configure(camera_config)
                self.picam2.start()
                time.sleep(RobotConfig.CAMERA_WARMUP_SEC)
                self.hardware_available = True
                logger.info("Picamera2 hardware initialized successfully.")
            except Exception as e:
                logger.warning(f"Picamera2 hardware not accessible: {e}. Falling back to software capture mode.")
                self.hardware_available = False
        else:
            logger.info("CameraService operating in development/mock mode (MOCK_HARDWARE=True).")

    def capture_leaf_image(self, plant_id: str) -> str:
        """
        Captures a leaf image for the specified plant and saves it to disk.
        Returns the absolute filepath of the saved JPEG.
        """
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_plant = "".join(c for c in plant_id if c.isalnum() or c in ("-", "_"))
        filename = f"leaf_{safe_plant}_{timestamp_str}.jpg"
        filepath = self.output_dir / filename

        if self.hardware_available and self.picam2:
            try:
                self.picam2.capture_file(str(filepath))
                logger.info(f"Captured hardware leaf image: {filepath}")
                return str(filepath)
            except Exception as e:
                logger.error(f"Hardware camera capture failed: {e}. Creating fallback image.")

        # Software / Mock fallback image generation
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (640, 480), color=(18, 38, 26))
            draw = ImageDraw.Draw(img)
            draw.rectangle([40, 40, 600, 440], outline=(52, 211, 153), width=2)
            draw.text((60, 60), f"FloraBot Autonomous Inspection", fill=(255, 255, 255))
            draw.text((60, 90), f"Plant ID: {plant_id}", fill=(52, 211, 153))
            draw.text((60, 120), f"Captured: {datetime.now().isoformat()}", fill=(148, 163, 184))
            draw.text((60, 150), f"Mode: Automated Mock Shutter", fill=(245, 158, 11))
            img.save(str(filepath), format="JPEG", quality=85)
            logger.info(f"Created software demonstration leaf image: {filepath}")
            return str(filepath)
        except Exception as e:
            # Absolute minimal fallback if PIL is not installed
            with open(filepath, "wb") as f:
                # Minimal 1x1 JPEG byte sequence
                f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9')
            logger.info(f"Saved fallback binary image: {filepath}")
            return str(filepath)

    def close(self):
        if self.picam2 and self.hardware_available:
            try:
                self.picam2.stop()
                self.picam2.close()
            except Exception:
                pass
            self.hardware_available = False
