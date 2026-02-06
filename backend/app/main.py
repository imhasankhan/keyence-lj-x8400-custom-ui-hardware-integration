from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sensor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for sensor connection
sensor_state = {
    "ip": "192.168.0.1",
    "port": 24691,
    "connected": False,
}

@app.post("/set_sensor")
def set_sensor(ip: str = Query(...), port: int = Query(...)):
    sensor_state["ip"] = ip
    sensor_state["port"] = port
    return {"status": "OK", "ip": ip, "port": port}

@app.post("/connect")
def connect_sensor():
    res = sensor.connect_sensor(sensor_state["ip"], sensor_state["port"])
    sensor_state["connected"] = res
    return {"connected": res}

@app.post("/disconnect")
def disconnect_sensor():
    sensor.disconnect_sensor()
    sensor_state["connected"] = False
    return {"connected": False}

@app.get("/status")
def get_status():
    return {
        "connected": sensor_state["connected"],
        "ip": sensor_state["ip"],
        "port": sensor_state["port"],
    }

@app.get("/profile")
def get_profile():
    if not sensor_state["connected"]:
        return {"profile": [], "status": "Not connected"}
    profile = sensor.get_profile_from_sensor(sensor_state["ip"], sensor_state["port"])
    if profile is None:
        return {"profile": [], "status": "Error connecting to sensor"}
    return {"profile": profile, "status": "OK"}

