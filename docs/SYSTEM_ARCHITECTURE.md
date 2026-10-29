# Automated Greenhouse Monitoring Robot — System Architecture

## 1. High-Level Architecture Overview

```mermaid
graph TD
    subgraph "Raspberry Pi 5 Robot Node"
        MainLoop["Autonomous Navigation & Inspection Loop"]
        Camera["Picamera2 Camera Module"]
        NPK["RS-485 Modbus NPK Soil Sensor"]
        AI["Leaf Disease Classification (TFLite/ONNX)"]
        SQLite[("Local SQLite Offline Queue (robot_offline.db)")]
        ApiClient["REST HTTP Client (api_client.py)"]
        Heartbeat["Robot Status & Heartbeat Service"]
    end

    subgraph "Central Backend (Node.js & Express)"
        Router["REST API Router & Auth Middleware"]
        Ingest["Idempotent Inspection Ingestion Engine"]
        AlertEngine["Nutrient & Disease Threshold Evaluator"]
        SocketServer["Socket.IO Real-Time Broadcast Server"]
        Sweeper["Robot Offline Sweeper (30s interval)"]
    end

    subgraph "Persistent Storage"
        MongoDB[("MongoDB Database (Atlas / Local)")]
        ImageStorage["Secure Uploads Directory (/uploads)"]
    end

    subgraph "Client Applications"
        WebClient["React + Vite Agricultural Dashboard (Browser)"]
        MobileClient["React Native Expo Mobile Application (Android/iOS)"]
    end

    %% Robot Data Flow
    MainLoop -->|Visit Plant Waypoint| NPK
    MainLoop -->|Trigger Shutter| Camera
    Camera -->|Leaf Image| AI
    NPK -->|N, P, K in mg/kg| MainLoop
    AI -->|Prediction & Confidence| MainLoop
    MainLoop -->|Step 1: Always Save First| SQLite
    SQLite -->|Step 2: Upload Attempt| ApiClient
    ApiClient -->|POST /api/inspections (Multipart)| Router
    Heartbeat -->|POST /api/robot/heartbeat| Router

    %% Backend Processing
    Router --> Ingest
    Ingest -->|Write Record| MongoDB
    Ingest -->|Store Binary| ImageStorage
    Ingest --> AlertEngine
    AlertEngine -->|Auto-Generate Alerts| MongoDB
    Ingest -->|inspection:completed| SocketServer
    AlertEngine -->|alert:created| SocketServer
    Sweeper -->|robot:offline| SocketServer

    %% Clients Subscription
    SocketServer -->|Live Events WebSocket| WebClient
    SocketServer -->|Live Events WebSocket| MobileClient
    WebClient -->|REST Inquiries / JWT| Router
    MobileClient -->|REST Inquiries / JWT| Router
```

---

## 2. End-to-End Inspection Sequence

1. **Waypoint Arrival:** Rover arrives at plant position (e.g., `PLANT-N1-R01-P03`).
2. **Soil Probing:** RS-485 Modbus sensor reads Nitrogen, Phosphorus, and Potassium registers in mg/kg.
3. **Optics Capture:** Picamera2 triggers a 1080p leaf capture to local disk.
4. **AI Inference:** Preprocessed image is passed through MobileNetV2 (TFLite runtime). If confidence is `< 0.65`, status is marked `uncertain`. If no model is configured, status is marked `not_configured`.
5. **Local SQLite Persistence:** Complete inspection record is saved to SQLite before any network call.
6. **Network Transmission:** Robot sends multipart `POST /api/inspections` with `X-Robot-Id` and `X-Robot-Key`.
7. **Idempotent Ingestion:** Backend checks if `inspectionId` exists. If so, returns `200 OK` (no duplicate record). If new, stores to MongoDB.
8. **Server Confirmation:** Upon receiving `200` or `201`, the robot marks the record as `uploaded` in SQLite.
9. **Event Emission:** Backend emits `inspection:completed` and any triggered `alert:created` over Socket.IO.
10. **Client Refresh:** Web dashboard and mobile app instantly reflect new measurements and alert badges.

---

## 3. Offline Resilience & Recovery Guarantees

- **No Data Loss:** Inspection records are **never deleted or dropped** before the backend confirms successful storage with HTTP 200/201.
- **Exponential Backoff:** If Wi-Fi is lost, failed uploads enter exponential backoff (`delay = min(300, 5 * 2^retry_count)`).
- **Automatic Queue Flushing:** Once Wi-Fi reconnects and the backend health endpoint responds, the rover flushes queued records in sequential batches.
- **Duplicate Prevention:** Unique inspection IDs ensure that retried uploads are handled idempotently without creating duplicate MongoDB records.
