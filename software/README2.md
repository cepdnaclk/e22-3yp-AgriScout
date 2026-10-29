# FloraBot — Automated Greenhouse Monitoring Robot Full-Stack System

[![CI Tests](https://img.shields.io/badge/backend%20tests-22%2F22%20passing-brightgreen)](file:///c:/Users/Suvini%20Gunawardana/OneDrive/Desktop/3yp/backend/tests)
[![Robot Tests](https://img.shields.io/badge/robot%20tests-7%2F7%20passing-brightgreen)](file:///c:/Users/Suvini%20Gunawardana/OneDrive/Desktop/3yp/robot/tests)
[![Node.js](https://img.shields.io/badge/node.js-v24+-339933)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-3.12+-3776ab)](https://python.org)
[![React](https://img.shields.io/badge/react-18+-61dafb)](https://react.dev)
[![React Native](https://img.shields.io/badge/react%20native-expo-black)](https://expo.dev)

A complete, production-grade, end-to-end autonomous greenhouse monitoring system. FloraBot pairs a **Raspberry Pi 5 rover** (equipped with a Picamera2 optics module and an RS-485 Modbus NPK soil sensor) with a high-throughput **Node.js/Express & MongoDB backend**, real-time **Socket.IO event bus**, a modern **React/Vite agricultural telemetry dashboard**, and a **React Native (Expo) mobile application**.

---

## 1. Project Directory Structure

```text
greenhouse-robot/
├── backend/                # Node.js, Express, MongoDB, Socket.IO, Jest tests
│   ├── src/
│   │   ├── config/         # Database connection & validated environment config
│   │   ├── models/         # Mongoose models: User, Greenhouse, Plant, Inspection, Alert, Robot
│   │   ├── middleware/     # JWT Auth, Robot API Key auth, Multer uploads, Error handling
│   │   ├── controllers/    # Business logic for all 6 core resources
│   │   ├── routes/         # REST endpoints: auth, greenhouses, plants, inspections, alerts, robots, health
│   │   ├── services/       # Socket.IO broadcaster, Alert evaluation engine, Robot offline sweeper
│   │   ├── utils/          # Seed data generator and structured logger
│   │   ├── app.js          # Express app configuration & middleware pipeline
│   │   └── server.js       # HTTP server, Socket.IO, DB lifecycle & graceful shutdown
│   ├── tests/              # 22 automated Jest unit & integration tests with MongoMemoryServer
│   ├── uploads/            # Protected local storage for captured leaf inspection images
│   ├── .env.example        # Environment template
│   └── package.json
│
├── web/                    # React 18, Vite, React Router v6, Recharts, Lucide
│   ├── src/
│   │   ├── api/            # Axios API client with automatic JWT token interceptor
│   │   ├── context/        # AuthContext (JWT/RBAC) & SocketContext (real-time telemetry)
│   │   ├── components/     # Glassmorphic UI components, MetricCard, StatusBadge, InspectionModal
│   │   ├── pages/          # 12 distinct pages: Dashboard, Greenhouses, Plants, Inspections,
│   │   │                   # Disease Detection, NPK Analytics, Alerts, Robots, Camera, Settings, Login
│   │   ├── index.css       # Agricultural IoT glassmorphic design system
│   │   └── main.jsx
│   ├── vite.config.js      # Reverse-proxy config for /api, /uploads, and /socket.io
│   └── package.json
│
├── mobile/                 # React Native, Expo, React Navigation, Notifications
│   ├── src/
│   │   ├── api/            # Mobile API client with dynamic LAN host config
│   │   ├── context/        # Mobile Auth & Socket.IO Context with Expo local notifications
│   │   ├── navigation/     # Native Stack + Bottom Tab Navigator
│   │   ├── screens/        # Dashboard, Plants, PlantDetail, Inspections, Alerts, Robot, Settings, Login
│   │   └── theme/          # Mobile color tokens
│   ├── app.json            # Expo configuration
│   └── package.json
│
├── robot/                  # Raspberry Pi 5 Autonomous Inspection Agent (Python 3)
│   ├── config.py           # Configuration loader from .env
│   ├── camera_service.py   # Picamera2 hardware driver with off-Pi fallback capture
│   ├── npk_sensor_service.py # Modbus RTU / RS-485 NPK sensor driver (N, P, K in mg/kg)
│   ├── leaf_detection_service.py # Edge AI classifier (TFLite/ONNX) with confidence thresholding
│   ├── offline_queue.py    # Local SQLite persistent queue (survives reboots, exponential backoff)
│   ├── api_client.py       # Multipart HTTP client with robot authentication headers
│   ├── robot_status_service.py # Battery simulation/monitoring & background heartbeat loop
│   ├── plant_inspection_service.py # 12-step inspection sequence orchestrator
│   ├── main.py             # Rover autonomous waypoint navigation entrypoint
│   ├── tests/              # Pytest test suite for offline queue, AI fallback, and sensors
│   ├── requirements.txt
│   └── .env.example
│
├── ml/                     # Machine Learning Pipeline
│   ├── classes.json        # 10 agricultural leaf disease classes
│   ├── dataset_prep.py     # Train/Val/Test split utility
│   ├── train.py            # PyTorch MobileNetV2 transfer learning script & ONNX export
│   ├── export_tflite.py    # FP16/INT8 post-training quantization script
│   └── README.md           # Dataset preparation and edge deployment guide
│
├── docs/                   # Engineering Documentation
│   ├── SYSTEM_ARCHITECTURE.md # Architecture, sequence flows, and offline recovery guarantees
│   ├── API_REFERENCE.md    # Detailed API endpoint reference
│   └── HARDWARE_SETUP.md   # RS-485 Modbus wiring, Picamera2 setup, and systemd service
│
├── .gitignore
└── README.md
```

---

## 2. Prerequisites

- **Node.js:** v18.0.0 or higher (v24 LTS recommended)
- **npm:** v9.0.0 or higher
- **Python:** v3.10, v3.11, or v3.12
- **MongoDB:** Local MongoDB instance (`mongodb://127.0.0.1:27017`) OR a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Expo Go (optional for mobile):** Install Expo Go app on your Android or iOS device for physical mobile testing.

---

## 3. Quickstart Guide (Step-by-Step)

### Step 3.1: Backend Setup & Seeding

1. Open a terminal and enter the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*
4. If using MongoDB Atlas, update `MONGODB_URI` in `backend/.env`.
5. Populate the database with realistic agricultural demo data:
   ```bash
   npm run seed
   ```
   *This seeds demo greenhouses, 8 tomato/pepper plants, admin/operator users, robot rover telemetry, and historical inspections.*
6. Run the automated backend test suite:
   ```bash
   npm test
   ```
   *(All 22 unit & integration tests run against an isolated in-memory MongoDB)*
7. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at **`http://localhost:5000`** with health check at `http://localhost:5000/api/health`.

---

### Step 3.2: Website Dashboard Setup

1. Open a new terminal and navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **`http://localhost:5173`**.
5. Log in using any of the quick-demo accounts:
   - **Administrator:** `admin@greenhouse.local` / `AdminPass123!`
   - **Agronomist (Operator):** `operator@greenhouse.local` / `OperatorPass123!`
   - **Viewer:** `viewer@greenhouse.local` / `ViewerPass123!`

---

### Step 3.3: Mobile Application Setup (Expo)

1. Open a new terminal and enter the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install mobile dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npm start
   ```
4. **Running on Physical Android/iOS Device:**
   - Scan the terminal QR code with the **Expo Go** app.
   - On the mobile Login screen, tap **"⚙ Server Connection URL"** and set the address to your computer's local Wi-Fi IP (e.g. `http://192.168.1.150:5000`).
5. **Running on Android Emulator:**
   - Press `a` in the Expo terminal (uses default `http://10.0.2.2:5000`).

---

### Step 3.4: Raspberry Pi Software Setup

1. In another terminal, enter the `robot` folder:
   ```bash
   cd robot
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Verify environment configuration in `robot/.env`:
   ```env
   ROBOT_ID=ROBOT-ALPHA-01
   ROBOT_API_KEY=ghr_secret_alpha_key_2026
   BACKEND_URL=http://localhost:5000
   MOCK_HARDWARE=true  # Set to false on physical Raspberry Pi with RS-485 probe attached
   ```
4. Run robot unit tests:
   ```bash
   pytest tests -v
   ```
5. Launch the autonomous robot inspection sequence:
   ```bash
   python main.py
   ```
   *Watch the terminal: The rover visits plants, reads soil NPK values, captures leaf imagery, runs AI classification, saves records to SQLite first, and streams inspections in real-time to both the web dashboard and mobile app via Socket.IO!*

---

## 4. Key Architectural Features

### 4.1. Offline Queue & Zero-Data-Loss Guarantee
- When the robot is in a greenhouse dead-zone with dropped Wi-Fi, inspection records are **persisted locally in SQLite (`data/robot_offline.db`) first**.
- Records transition through `pending` ➔ `uploading` ➔ `uploaded`.
- Records are **never deleted or discarded** prior to HTTP 200/201 server confirmation.
- Temporary network timeouts trigger **exponential backoff** (`min(300s, 5 * 2^retries)`).
- As soon as connectivity returns, the rover automatically flushes the offline backlog in batches.

### 4.2. Idempotent Ingestion
- Every inspection carries a deterministic `inspectionId` (e.g. `INSP-ROBOT-ALPHA-01-PLANT-01-1730000000`).
- If a retransmitted packet arrives after a network hiccup, MongoDB acknowledges the existing record with `200 OK` rather than generating duplicate entries.

### 4.3. True Sensor Measurement Fidelity
- Missing sensor values are stored as **explicit `null` values**, never coerced into numeric `0`.
- Nitrogen, Phosphorus, and Potassium are tracked with explicit units (`mg/kg`) and probe status (`measured`, `unavailable`, `error`).

### 4.4. AI Leaf Disease Classification (Edge Inference)
- Supports MobileNetV2 and EfficientNet models in `.tflite` or `.onnx` formats.
- If a model file is not configured, the rover gracefully reports `AI model not configured` without crashing.
- Predictions with confidence `< 65%` are explicitly categorized as `uncertain`.

---

## 5. Security & RBAC Matrix

| Role | Greenhouses | Plant Directory | Inspection Logs | Acknowledge Alerts | Register Robots |
|---|---|---|---|---|---|
| **Admin** | Full CRUD | Full CRUD | Read / Filter | Yes | Yes (Issue API Keys) |
| **Operator** | Create / Update | Create / Update | Read / Filter | Yes | View Only |
| **Viewer** | Read Only | Read Only | Read Only | No | No |
| **Robot** | N/A | Ingest Scans | Multipart Upload | Telemetry Ping | Heartbeat Only |

---

## 6. Common Errors & Troubleshooting

### Issue: "Network connection error" on Raspberry Pi
- **Cause:** Backend server is not running or `BACKEND_URL` in `robot/.env` is incorrect.
- **Fix:** If running on a separate computer on the same Wi-Fi, run `ipconfig` (Windows) or `ifconfig` (Linux) to find the computer's LAN IP (e.g., `192.168.1.50`) and update `BACKEND_URL=http://192.168.1.50:5000`.

### Issue: "Robot authentication failed: Invalid API key"
- **Cause:** The `ROBOT_API_KEY` in `robot/.env` does not match the hashed key in MongoDB.
- **Fix:** Run `npm run seed` in `backend` to reset the default demo rover key (`ghr_secret_alpha_key_2026`), or register a new rover from the web dashboard Settings page.

### Issue: "Picamera2 hardware not accessible"
- **Cause:** Script running on non-Raspberry Pi computer or camera cable not detected.
- **Fix:** The system automatically falls back to software demonstration capture mode. On a physical Pi 5, verify the ribbon cable is seated in `CAM/DISP 1` and test with `rpicam-hello`.

---

## 7. License

Licensed under the MIT License. Developed for automated precision agriculture research and greenhouse robotics.
