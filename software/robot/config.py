import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env file
load_dotenv(BASE_DIR / '.env')

class RobotConfig:
    # Identity
    ROBOT_ID = os.getenv('ROBOT_ID', 'ROBOT-ALPHA-01').strip().upper()
    ROBOT_NAME = os.getenv('ROBOT_NAME', 'Autonomous Scout Rover Alpha')
    ROBOT_API_KEY = os.getenv('ROBOT_API_KEY', 'ghr_secret_alpha_key_2026').strip()
    GREENHOUSE_ID = os.getenv('GREENHOUSE_ID', 'GH-NORTH-01').strip().upper()

    # Backend
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000').strip().rstrip('/')

    # Storage
    SQLITE_DB_PATH = Path(os.getenv('SQLITE_DB_PATH', str(BASE_DIR / 'data' / 'robot_offline.db')))
    IMAGE_STORAGE_DIR = Path(os.getenv('IMAGE_STORAGE_DIR', str(BASE_DIR / 'images')))

    # Hardware Emulation / Testing Flag
    MOCK_HARDWARE = os.getenv('MOCK_HARDWARE', 'true').lower() in ('true', '1', 'yes')

    # Modbus RS-485 Configuration
    MODBUS_PORT = os.getenv('MODBUS_PORT', '/dev/ttyUSB0')
    MODBUS_BAUDRATE = int(os.getenv('MODBUS_BAUDRATE', '9600'))
    MODBUS_PARITY = os.getenv('MODBUS_PARITY', 'N')
    MODBUS_STOPBITS = int(os.getenv('MODBUS_STOPBITS', '1'))
    MODBUS_BYTESIZE = int(os.getenv('MODBUS_BYTESIZE', '8'))
    MODBUS_SLAVE_ID = int(os.getenv('MODBUS_SLAVE_ID', '1'))
    MODBUS_TIMEOUT = float(os.getenv('MODBUS_TIMEOUT', '1.0'))

    # Modbus Register Addresses (Configurable per sensor model)
    REG_NITROGEN = int(os.getenv('REG_NITROGEN', '30'))
    REG_PHOSPHORUS = int(os.getenv('REG_PHOSPHORUS', '31'))
    REG_POTASSIUM = int(os.getenv('REG_POTASSIUM', '32'))

    # Camera settings
    CAMERA_WIDTH = int(os.getenv('CAMERA_RESOLUTION_WIDTH', '1920'))
    CAMERA_HEIGHT = int(os.getenv('CAMERA_RESOLUTION_HEIGHT', '1080'))
    CAMERA_WARMUP_SEC = float(os.getenv('CAMERA_WARMUP_SEC', '1.0'))

    # AI Model
    AI_MODEL_PATH = os.getenv('AI_MODEL_PATH', '').strip()
    AI_LABELS_PATH = os.getenv('AI_LABELS_PATH', '').strip()
    AI_CONFIDENCE_THRESHOLD = float(os.getenv('AI_CONFIDENCE_THRESHOLD', '0.65'))

    # Timing
    INSPECTION_INTERVAL_SEC = int(os.getenv('INSPECTION_INTERVAL_SEC', '15'))
    HEARTBEAT_INTERVAL_SEC = int(os.getenv('HEARTBEAT_INTERVAL_SEC', '10'))

# Ensure runtime directories exist
RobotConfig.SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
RobotConfig.IMAGE_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
