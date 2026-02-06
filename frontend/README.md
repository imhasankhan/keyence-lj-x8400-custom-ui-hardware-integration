# Frontend – Custom UI for Keyence LJ-X8400 Laser Profiler

This repository contains the **React + Tailwind CSS frontend** for a custom
industrial user interface developed for the **Keyence LJ-X8400 laser profiler**.

The frontend communicates with a FastAPI backend to visualize live 2D profile
data, perform measurements, and support future 3D reconstruction and robotic
integration workflows.

---

## Purpose

The goal of this frontend is to provide a **browser-based alternative to vendor
software**, offering:
- Real-time profile visualization
- Interactive measurement tools
- Clean and operator-friendly UI
- Easy integration with industrial backends

---

## Technology Stack
- React 18
- Tailwind CSS 3
- JavaScript (ES6+)
- REST API integration (FastAPI backend)

---

## Features
- Live 2D profile visualization
- Point-to-point and axis-based measurements
- Modular component-based UI design
- Responsive layout using Tailwind CSS
- Backend-agnostic API communication layer

---

## Running the Frontend (Development)

### 1. Install dependencies

```bash
npm install
```
---
### 2. Start development server

```bash
npm start
```
---

The application will be available at:
http://localhost:3000

⚠️ The backend must be running separately for live data.

### Backend Integration

This frontend is designed to work with the FastAPI backend located in:

/backend

The backend handles:

Sensor communication
Profile acquisition
Data preprocessing

### Project Context

This frontend was developed as part of a Master’s-level industrial automation
project at Darmstadt University of Applied Sciences, focused on sensor
visualization, measurement, and extensible UI design for industrial systems.

### Author

Muhammad Hasan Khan
