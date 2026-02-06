> Industrial sensor UI & automation portfolio project  
> Role: Automation / Software Engineer (Team Project)  
> Environment: Real sensor hardware, laboratory-tested

# Custom UI & Hardware Integration for Keyence LJ-X8400 Laser Profiler

## Overview
This project presents the design and development of a custom, browser-based
user interface for the Keyence LJ-X8400 2D laser profiler. The system was
developed as part of a Master’s-level team project at Hochschule Darmstadt
and serves as a flexible, vendor-independent alternative to proprietary
sensor software.

The solution enables real-time 2D profile streaming, advanced measurement
tools, 3D surface reconstruction, data export, and preparation for robotic
integration.

> ⚠️ Due to vendor licensing and academic restrictions, the Keyence SDK and
full source code are not publicly included. This repository serves as a
technical portfolio and system documentation.

---

## Project Duration
April 2025 – August 2025

---

## System Architecture

### Hardware
- Sensor: Keyence LJ-X8400 2D Laser Profiler
- Controller: Keyence LJ-X8000
- Interface: Ethernet (TCP/IP)
- Optional robotic integration: KUKA iiwa (mount prepared)

### Software
- Frontend: React (browser-based UI)
- Backend: FastAPI (Python)
- Communication:
  - REST API (control & configuration)
  - WebSocket (real-time profile streaming)

---

## Key Features

### Real-Time Data Acquisition
- Live 2D profile streaming via WebSocket
- Configurable polling and capture intervals
- Visual connection and data status indicators

### Measurement & Analysis
- Horizontal and vertical ruler-based measurements
- Point-to-point distance and angle calculation
- Path-length (curve-following) measurements
- Min/max height extraction within selected ranges

### 3D Reconstruction
- Stitching of multiple 2D profiles into 3D surfaces
- Interactive 3D visualization using Three.js
- X- and Y-axis slicing with synchronized 2D inspection
- Resettable camera and slice controls

### Data Handling
- CSV export of captured scan data
- CSV import for offline analysis
- Separation of live acquisition and stored datasets

---

## User Interface Structure
- Live Data Page: real-time profile capture and visualization
- 3D Data Page: surface reconstruction and slice inspection
- 2D Captured Data Page: detailed analysis of stored scans
- Compare Data Page: synchronized comparison of two datasets
- Help Page: in-app usage guidance

---

## Backend Design Highlights
- Asynchronous FastAPI backend for non-blocking sensor I/O
- Python SDK wrapper using `ctypes` for vendor DLL integration
- Clean separation of API, business logic, and hardware access
- Robust handling of connection loss and invalid data
- Data normalization, dead-zone filtering, and spike suppression

---

## Hardware Integration
- Custom sensor mounting bracket designed in Fusion 360
- 3D-printed using Bambu Lab X1 Carbon
- Prepared for robotic mounting on KUKA iiwa
- Mechanical design completed; robotic motion testing planned
  as future work

---

## Development Practices
- GitLab-based issue tracking and version control
- Modular frontend and backend architecture
- Clear separation of concerns
- Comprehensive technical documentation
- Team-based development with defined responsibilities

---

## Project Status
- Core functionality fully implemented
- Tested with real Keyence LJ-X8400 hardware
- Robotic integration prepared at hardware level
- Future extensions identified (ROS integration, ML-based inspection)

---

## Skills & Technologies
- Industrial Sensors & Measurement Systems
- FastAPI (Python)
- React & Web-Based Visualization
- Real-Time Data Streaming (WebSockets)
- 2D / 3D Measurement Algorithms
- Hardware Integration & 3D Printing
- GitLab Workflow & Documentation

---

## Team Project
Developed as a six-member team project  
Hochschule Darmstadt – Electrical Engineering & Information Technology (M.Sc.)

---

## Author
Muhammad Hasan Khan
