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

### Environment Setup

Create and activate a virtual environment:

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

### 2. Run the development server
bash
Copy
Edit
uvicorn app:app --reload --host 0.0.0.0 --port 8000
The server will be available at http://localhost:8000
