# FastAPI Backend for Keyence LJ-X8400 Laser Profiler

This repository contains a FastAPI-based backend designed to interface with
the Keyence LJ-X8400 laser profiler. The backend acts as a middleware layer
between the physical sensor hardware and a frontend application, providing
clean and structured APIs for sensor control and profile data acquisition.

The backend was developed as part of an industrial sensor visualization
project and is structured to be modular, testable, and frontend-agnostic.

---

## Backend Responsibilities
- Manage connection state with the laser profiler
- Configure sensor communication parameters
- Retrieve and preprocess 2D profile data
- Expose REST endpoints for frontend consumption
- Abstract vendor-specific SDK complexity

---

## Technology Stack
- Python 3
- FastAPI
- Uvicorn (ASGI server)
- NumPy
- Vendor SDK wrapper (excluded from repository)

---

## API Overview

| Method | Endpoint       | Description                              |
|--------|----------------|------------------------------------------|
| POST   | `/set_sensor`  | Store sensor IP and communication port   |
| POST   | `/connect`     | Establish connection to the sensor       |
| POST   | `/disconnect`  | Close sensor connection                  |
| GET    | `/status`      | Get current connection status            |
| GET    | `/profile`     | Retrieve latest 2D profile data          |

These endpoints are designed to be consumed by a browser-based frontend
(e.g. React) or any other client application.

---

## Running the Backend (Development)

### 1. Install dependencies

Navigate to the `BackEnd` directory and set up your environment:

```bash
cd BackEnd
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On Linux/macOS

pip install -r requirements.txt
```
### 2. Run the development server

uvicorn app:app --reload --host 0.0.0.0 --port 8000
The server will be available at http://localhost:8000
---

## Interactive API documentation

FastAPI automatically provides interactive API documentation (Swagger UI)
for exploring and testing all available endpoints.

```bash
http://localhost:8000/docs
```
---

## Source Code Note

Vendor SDK binaries (DLL/.so) and proprietary libraries are intentionally
excluded due to licensing restrictions. The backend structure demonstrates
how such SDKs are integrated through a Python abstraction layer without
exposing vendor-specific code.

For portfolio purposes, simulated profile data may be returned when the
physical sensor is not connected.

---

## Intended Use
- Industrial sensor visualization systems
- Real-time measurement and inspection applications
- Research and prototyping involving laser profilers
- Integration with custom frontend interfaces

---

## Author
Muhammad Hasan Khan
