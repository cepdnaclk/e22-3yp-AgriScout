# Raspberry Pi 5 & Sensor Hardware Integration Guide

## 1. Hardware Architecture

- **Main Compute:** Raspberry Pi 5 (8GB RAM recommended) running Raspberry Pi OS Bookworm (64-bit).
- **Vision Subsystem:** Raspberry Pi Camera Module 3 (Wide-angle or Standard) connected via 22-pin CSI/DSI ribbon cable.
- **Nutrient Sensing Subsystem:** Industrial RS-485 NPK 3-in-1 / 7-in-1 Soil Multi-Sensor.
- **Communication Bridge:** Industrial USB-to-RS485 transceiver (FTDI or CH340 chipset) plugged into USB 3.0 port.
- **Power Delivery:** 5V 5A USB-C Power Delivery power bank or step-down buck converter (12V to 5V 5A).

---

## 2. RS-485 Modbus NPK Sensor Wiring

Connect the 4 wires of the NPK soil probe to the USB-RS485 adapter and power source:

| Sensor Wire Color | Function | Connection Target |
|---|---|---|
| **Brown** | VCC Power (9V – 24V DC) | External 12V DC Power Supply Positive (+) |
| **Black** | GND Ground | External 12V DC Power Supply Ground (-) & Pi GND |
| **Yellow** | RS-485 Signal A (A+) | USB-to-RS485 Transceiver Terminal A+ |
| **Blue** | RS-485 Signal B (B-) | USB-to-RS485 Transceiver Terminal B- |

> [!WARNING]
> Do NOT power industrial RS-485 NPK sensors from the Raspberry Pi 3.3V or 5V GPIO pins. Most agricultural NPK probes require **9V – 24V DC** to deliver accurate measurements. Common ground must be shared.

---

## 3. Raspberry Pi Serial & Camera Configuration

1. Connect the Camera Module 3 ribbon cable to **CAM/DISP 1** on the Pi 5.
2. Enable camera and serial interfaces in `/boot/firmware/config.txt`:
   ```ini
   dtoverlay=imx708
   enable_uart=1
   ```
3. Test camera hardware:
   ```bash
   rpicam-hello --timeout 5000
   rpicam-still -o test_leaf.jpg
   ```
4. Verify USB-to-RS485 adapter:
   ```bash
   ls -l /dev/ttyUSB*
   # Should list /dev/ttyUSB0
   ```
   Add user to dialout group:
   ```bash
   sudo usermod -aG dialout $USER
   ```

---

## 4. Automatic Boot Service (systemd)

To make FloraBot start automatically upon Raspberry Pi power-up:

Create `/etc/systemd/system/florabot.service`:

```ini
[Unit]
Description=FloraBot Autonomous Greenhouse Robot Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/greenhouse-robot/robot
ExecStart=/usr/bin/python3 /home/pi/greenhouse-robot/robot/main.py
Restart=always
RestartSec=10
EnvironmentFile=/home/pi/greenhouse-robot/robot/.env

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable florabot.service
sudo systemctl start florabot.service
sudo journalctl -u florabot.service -f
```
