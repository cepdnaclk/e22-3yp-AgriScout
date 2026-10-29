# REST API Reference Manual

The FloraBot API serves both the web dashboard, mobile application, and the autonomous Raspberry Pi robot fleet.

Base URL: `http://<host>:5000/api`

---

## 1. Authentication Endpoints

### Register User
`POST /api/auth/register`
- **Access:** Public (First user bootstraps as `admin`; subsequent registrations default to `viewer` unless authorized by an admin token).
- **Body:**
  ```json
  {
    "name": "Jane Agronomist",
    "email": "jane@greenhouse.local",
    "password": "Password123!",
    "role": "operator"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User created successfully with role 'admin'.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6720f4c...",
      "name": "Jane Agronomist",
      "email": "jane@greenhouse.local",
      "role": "admin"
    }
  }
  ```

### Login
`POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "admin@greenhouse.local",
    "password": "AdminPass123!"
  }
  ```
- **Response (200 OK):** Returns JWT token and user profile.

### Current User Profile
`GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User record.

---

## 2. Health Check

`GET /api/health`
- **Access:** Public
- **Response (200 OK / 503 Degraded):**
  ```json
  {
    "status": "healthy",
    "uptime": 142.5,
    "timestamp": "2026-10-29T06:45:00.000Z",
    "service": "greenhouse-robot-backend",
    "version": "1.0.0",
    "database": {
      "connected": true,
      "state": "connected",
      "host": "cluster0.mongodb.net",
      "name": "greenhouse_robot"
    }
  }
  ```

---

## 3. Greenhouses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/greenhouses` | Authenticated | List all greenhouse zones with plant and alert counts |
| `POST` | `/api/greenhouses` | Admin, Operator | Create new greenhouse zone |
| `GET` | `/api/greenhouses/:id` | Authenticated | Get greenhouse details by `greenhouseId` or `_id` |
| `PATCH` | `/api/greenhouses/:id` | Admin, Operator | Update zone metadata |
| `DELETE` | `/api/greenhouses/:id` | Admin | Delete zone and associated plants |

---

## 4. Plants

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/plants` | Authenticated | List plants (filters: `greenhouseId`, `healthStatus`, `search`, `page`, `limit`) |
| `POST` | `/api/plants` | Admin, Operator | Register plant (requires unique row/position in greenhouse) |
| `GET` | `/api/plants/:plantId` | Authenticated | Plant details with latest inspection & alerts |
| `PATCH` | `/api/plants/:plantId` | Admin, Operator | Update plant details or status |
| `GET` | `/api/plants/:plantId/history` | Authenticated | Chronological inspection log with NPK time-series |

---

## 5. Inspections (Robot & User)

### Ingest Inspection (Multipart or JSON)
`POST /api/inspections`
- **Access:** Robot Credentials (`X-Robot-Id`, `X-Robot-Key`) OR Authenticated User (`Bearer <token>`).
- **Multipart Form Fields:**
  - `inspectionId`: String (unique identifier)
  - `robotId`: String (e.g. `ROBOT-ALPHA-01`)
  - `greenhouseId`: String (e.g. `GH-NORTH-01`)
  - `plantId`: String (e.g. `PLANT-N1-R01-P03`)
  - `timestamp`: ISO timestamp
  - `npkValues`: JSON string or object `{"nitrogen": 120, "phosphorus": 45, "potassium": 160, "sensorStatus": "measured"}`
  - `aiPrediction`: JSON string or object `{"disease": "Healthy", "confidence": 0.95, "status": "detected"}`
  - `leafImage`: Binary file (optional JPEG/PNG upload)
  - `uploadMetadata`: JSON string `{"isOfflineQueued": false, "retryCount": 0}`
- **Response (201 Created or 200 Idempotent OK):**
  ```json
  {
    "success": true,
    "message": "Inspection recorded successfully",
    "isDuplicate": false,
    "data": { ... }
  }
  ```

---

## 6. Alerts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/alerts` | Authenticated | List alerts (filters: `greenhouseId`, `acknowledged`, `severity`, `alertType`) |
| `PATCH` | `/api/alerts/:id/acknowledge` | Admin, Operator | Mark alert acknowledged with user audit trail |

---

## 7. Robot Fleet Telemetry

### Heartbeat
`POST /api/robot/heartbeat`
- **Headers:** `X-Robot-Id`, `X-Robot-Key`
- **Body:** `{"batteryLevel": 88, "status": "online", "currentPlantId": "PLANT-01"}`
- **Response (200 OK):** Heartbeat acknowledged.

### Status / Error Report
`POST /api/robot/status`
- **Headers:** `X-Robot-Id`, `X-Robot-Key`
- **Body:** `{"errorStatus": {"hasError": true, "errorMessage": "Sensor timeout on /dev/ttyUSB0"}}`

### Register Robot
`POST /api/robots/register`
- **Access:** Admin only
- **Response (201 Created):** Returns generated API key (displayed once for safe storage in rover config).
