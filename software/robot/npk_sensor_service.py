import logging
import random
from datetime import datetime
from typing import Dict, Any, Optional
from config import RobotConfig

logger = logging.getLogger(__name__)

class NpkSensorService:
    """
    Modular Modbus RTU / RS-485 interface for soil NPK sensors.
    
    IMPORTANT HARDWARE INTEGRATION NOTE:
    Commercial NPK sensors (e.g. JXBS-3001, CWT-MB300, 7-in-1 Soil Multi-Sensors)
    use differing Modbus Holding Register addresses, baud rates, and slave IDs.
    All parameters are parameterized in RobotConfig and .env so they can be matched
    exactly to the manufacturer's manual without modifying core application logic.
    """
    def __init__(
        self,
        port: str = RobotConfig.MODBUS_PORT,
        baudrate: int = RobotConfig.MODBUS_BAUDRATE,
        slave_id: int = RobotConfig.MODBUS_SLAVE_ID,
        reg_n: int = RobotConfig.REG_NITROGEN,
        reg_p: int = RobotConfig.REG_PHOSPHORUS,
        reg_k: int = RobotConfig.REG_POTASSIUM,
        mock_mode: bool = RobotConfig.MOCK_HARDWARE
    ):
        self.port = port
        self.baudrate = baudrate
        self.slave_id = slave_id
        self.reg_n = reg_n
        self.reg_p = reg_p
        self.reg_k = reg_k
        self.mock_mode = mock_mode
        self.client = None

        if not self.mock_mode:
            try:
                from pymodbus.client import ModbusSerialClient
                self.client = ModbusSerialClient(
                    port=self.port,
                    baudrate=self.baudrate,
                    parity=RobotConfig.MODBUS_PARITY,
                    stopbits=RobotConfig.MODBUS_STOPBITS,
                    bytesize=RobotConfig.MODBUS_BYTESIZE,
                    timeout=RobotConfig.MODBUS_TIMEOUT
                )
                connected = self.client.connect()
                if connected:
                    logger.info(f"Modbus RTU client connected to {self.port} at {self.baudrate} baud.")
                else:
                    logger.warning(f"Could not open serial port {self.port}. Driver remains in standby.")
            except ImportError:
                logger.warning("pymodbus not installed. Modbus hardware driver in standby.")
            except Exception as e:
                logger.error(f"Error initializing Modbus client: {e}")

    def read_npk_nutrients(self) -> Dict[str, Any]:
        """
        Reads Nitrogen (N), Phosphorus (P), and Potassium (K) from the Modbus sensor.
        
        Strict adherence to specification:
        - Unavailable readings are returned as None (distinguished from 0.0).
        - Correct units (mg/kg) are recorded.
        - Timestamp is recorded at the moment of measurement.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"

        if not self.mock_mode and self.client:
            try:
                # Read Holding Registers for N, P, K
                # Note: Many sensors have sequential registers, e.g. start at reg_n and read 3 registers
                result = self.client.read_holding_registers(
                    address=self.reg_n,
                    count=3,
                    slave=self.slave_id
                )

                if result.isError():
                    logger.warning(f"Modbus read error from slave {self.slave_id}: {result}")
                    return {
                        "nitrogen": None,
                        "phosphorus": None,
                        "potassium": None,
                        "unit": "mg/kg",
                        "sensorStatus": "error",
                        "measuredAt": timestamp,
                        "error": str(result)
                    }

                # Sensor readings in mg/kg
                n_val = float(result.registers[0])
                p_val = float(result.registers[1])
                k_val = float(result.registers[2])

                return {
                    "nitrogen": n_val,
                    "phosphorus": p_val,
                    "potassium": k_val,
                    "unit": "mg/kg",
                    "sensorStatus": "measured",
                    "measuredAt": timestamp
                }
            except Exception as e:
                logger.error(f"Modbus communication exception: {e}")
                return {
                    "nitrogen": None,
                    "phosphorus": None,
                    "potassium": None,
                    "unit": "mg/kg",
                    "sensorStatus": "error",
                    "measuredAt": timestamp,
                    "error": str(e)
                }

        elif self.mock_mode:
            # Emulated realistic readings for development/testing
            # Simulates realistic tomato greenhouse soil (N: 70-160, P: 35-70, K: 140-220 mg/kg)
            sim_n = random.randint(65, 155)
            sim_p = random.randint(30, 65)
            sim_k = random.randint(130, 210)
            return {
                "nitrogen": sim_n,
                "phosphorus": sim_p,
                "potassium": sim_k,
                "unit": "mg/kg",
                "sensorStatus": "measured",
                "measuredAt": timestamp,
                "isSimulated": True
            }

        else:
            # Hardware unconfigured and mock disabled -> explicitly unavailable
            return {
                "nitrogen": None,
                "phosphorus": None,
                "potassium": None,
                "unit": "mg/kg",
                "sensorStatus": "unavailable",
                "measuredAt": timestamp
            }

    def close(self):
        if self.client:
            try:
                self.client.close()
            except Exception:
                pass
