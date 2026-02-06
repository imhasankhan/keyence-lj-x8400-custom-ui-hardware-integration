# Backend – FastAPI Sensor Interface

This backend provides a REST-based and real-time interface between the
Keyence LJ-X8400 laser profiler and the browser-based frontend.

It acts as a controlled middleware layer that:
- Manages the sensor connection
- Retrieves profile data
- Exposes clean APIs to the frontend
- Hides vendor-specific SDK complexity

---

## Technology Stack
- Python
- FastAPI
- Async REST API
- Vendor SDK wrapper (excluded due to licensing)

---

## Responsibilities
- Connect / disconnect to the laser sensor
- Maintain connection state
- Retrieve latest 2D profile data
- Serve data to frontend via HTTP / WebSocket
- Normalize and preprocess raw sensor data

---

## API Endpoints (High-Level)
- `POST /set_sensor` – Configure sensor IP and port
- `POST /connect` – Establish connection to sensor
- `POST /disconnect` – Close connection
- `GET /status` – Connection status
- `GET /profile` – Latest 2D profile data

---

## Note on SDK
Vendor SDK binaries and headers are intentionally excluded due to
licensing restrictions. The backend structure and logic demonstrate
how the SDK is integrated via a Python wrapper.
