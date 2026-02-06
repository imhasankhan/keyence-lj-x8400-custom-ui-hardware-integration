import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useScanData } from "./ScanDataContext";

// ===================
// CSV Parser (robust)
// ===================
function parseScanCSV(csv) {
  return csv
    .trim()
    .split(/\r?\n/)       // handle CRLF and LF
    .slice(1)             // skip header
    .filter(line => line.trim().length > 0)
    .map(line =>
      line
        .split(",")
        .slice(1)         // skip first column (index/time)
        .map(v => Number(String(v).trim()))
    );
}

// ===================
// Reset Camera Handler
// ===================
function ResetCamera({ resetSignal }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (resetSignal) {
      camera.position.set(0, -300, 300);
      controls.target.set(50, 50, 0);
      controls.update();
    }
  }, [resetSignal, camera, controls]);
  return null;
}

// ===================
// 3D Surface Plot
// ===================
function Surface3DMesh({ surface, sliceX, sliceY, showSlice, activeSlice, resetSignal }) {
  const xStep = 0.1;
  const yStep = 2;
  const zScale = 1;

  // Precompute arrays + a BufferGeometry object
  const memo = useMemo(() => {
    const rows = surface.length;
    const cols = surface[0]?.length || 0;

    if (!rows || !cols) {
      return {
        rows, cols, zMin: 0, zMax: 0, maxDim: 1,
        geometry: null
      };
    }

    let zMin = Infinity, zMax = -Infinity;
    for (let y = 0; y < rows; y++) {
      const row = surface[y];
      for (let x = 0; x < cols; x++) {
        const z = row[x];
        // guard against NaNs
        if (Number.isFinite(z)) {
          if (z < zMin) zMin = z;
          if (z > zMax) zMax = z;
        }
      }
    }
    if (!Number.isFinite(zMin) || !Number.isFinite(zMax)) {
      // invalid data; bail gracefully
      return { rows, cols, zMin: 0, zMax: 0, maxDim: 1, geometry: null };
    }

    const maxDim = Math.max(cols * xStep, rows * yStep, Math.max(1, (zMax - zMin) * zScale));
    const vertexCount = rows * cols;

    const positions = new Float32Array(vertexCount * 3);
    const colors    = new Float32Array(vertexCount * 3);

    const color = new THREE.Color();
    let vi = 0, ci = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const raw = surface[y][x];
        const zValRaw = Number.isFinite(raw) ? raw : zMin; // sanitize
        const zVal = (zValRaw - zMin) * zScale;

        positions[vi++] = x * xStep;   // X
        positions[vi++] = y * yStep;   // Y
        positions[vi++] = zVal;        // Z

        // color mapping (clamped)
        const norm  = (zVal) / Math.max(1e-9, (zMax - zMin) * 0.07*zScale);
        color.setHSL((norm % 1), 1, 0.5);
        colors[ci++] = color.b;
        colors[ci++] = color.g;
        colors[ci++] = color.r;
      }
    }

    // indices
    const triCount = (rows - 1) * (cols - 1) * 6;
    const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
    const indices = new IndexArray(triCount);
    let ii = 0;
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        const a = y * cols + x;
        const b = a + 1;
        const c = a + cols;
        const d = c + 1;
        indices[ii++] = a; indices[ii++] = b; indices[ii++] = d;
        indices[ii++] = a; indices[ii++] = d; indices[ii++] = c;
      }
    }

    // Build a BufferGeometry explicitly
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals(); // safe even if we use Basic material
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return { rows, cols, zMin, zMax, maxDim, geometry };
  }, [surface]);

  const { rows, cols, zMin, zMax, maxDim, geometry } = memo;

  return (
    <div style={{ position: "relative", zIndex: 0, width: 900, height: 500, margin: "0 auto" }}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, -300, 300], fov: 60 }}
        style={{ width: "100%", height: "100%", background: "#cccccc" }}
      >
        <ambientLight intensity={10} />
        <directionalLight position={[0, 0, maxDim]} intensity={0.8} />
        <axesHelper args={[Math.max(1, maxDim / 3)]} />
        <OrbitControls makeDefault />
        <ResetCamera resetSignal={resetSignal} />

        {/* surface mesh */}
        {geometry && (
          <mesh geometry={geometry}>
            {/* unlit so it's always visible; switch to Standard if you want shading */}
            <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* X slice */}
        {showSlice && activeSlice === "x" && rows > 0 && (
          <mesh position={[sliceX * xStep, (rows * yStep) / 2, Math.max(0.5, ((zMax - zMin) * zScale) / 2)]}>
            <boxGeometry args={[1, rows * yStep, Math.max(1, (zMax - zMin) * zScale)]} />
            <meshBasicMaterial color="#ff0000" opacity={0.3} transparent />
          </mesh>
        )}

        {/* Y slice */}
        {showSlice && activeSlice === "y" && cols > 0 && (
          <mesh position={[(cols * xStep) / 2, sliceY * yStep, Math.max(0.5, ((zMax - zMin) * zScale) / 2)]}>
            <boxGeometry args={[cols * xStep, 1, Math.max(1, (zMax - zMin) * zScale)]} />
            <meshBasicMaterial color="#00cc00" opacity={0.3} transparent />
          </mesh>
        )}
      </Canvas>
    </div>
  );
}

// ===================
// Main Viewer Component
// ===================
export default function Viewer3D({ onSliceChange }) {
  const { surface, setSurface } = useScanData();
  const fileInput = useRef();

  // Persistent slice indices
  const [sliceX, setSliceX] = useState(() => Number(localStorage.getItem("viewer3D_sliceX") ?? 0));
  const [sliceY, setSliceY] = useState(() => Number(localStorage.getItem("viewer3D_sliceY") ?? 0));

  // One active slice + show/hide toggle
  const [activeSlice, setActiveSlice] = useState(() => {
    const stored = localStorage.getItem("viewer3D_activeSlice");
    return stored === "y" ? "y" : "x";
  });
  const [showSlice, setShowSlice] = useState(() => {
    const stored = localStorage.getItem("viewer3D_showSlice");
    return stored ? JSON.parse(stored) : false;
  });

  const [resetView, setResetView] = useState(false);

  // Persist settings
  useEffect(() => localStorage.setItem("viewer3D_sliceX", String(sliceX)), [sliceX]);
  useEffect(() => localStorage.setItem("viewer3D_sliceY", String(sliceY)), [sliceY]);
  useEffect(() => localStorage.setItem("viewer3D_activeSlice", activeSlice), [activeSlice]);
  useEffect(() => localStorage.setItem("viewer3D_showSlice", JSON.stringify(showSlice)), [showSlice]);

  // Validate on surface load/resize
  useEffect(() => {
    if (surface.length > 0) {
      const maxX = surface[0].length - 1;
      const maxY = surface.length - 1;
      if (sliceX > maxX) setSliceX(Math.max(0, Math.floor(maxX / 2)));
      if (sliceY > maxY) setSliceY(0);
    }
  }, [surface, sliceX, sliceY]);

  // slice profiles
  const sliceProfileX = surface.length > 0 ? surface.map(row => row[sliceX] ?? 0) : [];
  const sliceProfileY = surface.length > 0 ? (surface[sliceY] || []) : [];
  const currentProfile = activeSlice === "x" ? sliceProfileX : sliceProfileY;

  // Notify parent whenever the visible slice changes
  useEffect(() => {
    if (!onSliceChange) return;
    if (showSlice && surface.length > 0) {
      onSliceChange(currentProfile, activeSlice);
    } else {
      onSliceChange([], activeSlice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSlice, activeSlice, sliceX, sliceY, surface]);

  // Slider RAF throttles (smoother dragging)
  const rafRef = useRef(null);
  const onChangeSliceX = (e) => {
    const v = Number(e.target.value);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setSliceX(v));
  };
  const onChangeSliceY = (e) => {
    const v = Number(e.target.value);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setSliceY(v));
  };

  function handleLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const arr = parseScanCSV(evt.target.result);
      setSurface(arr);
      if (arr.length > 0) {
        const maxX = arr[0].length - 1;
        const maxY = arr.length - 1;
        setSliceX(prev => Math.min(prev, maxX));
        setSliceY(prev => Math.min(prev, maxY));
      }
      // Optionally recentre view on load:
      setResetView(prev => !prev);
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    // keeping your original localStorage clears (harmless even though surface isn't persisted)
    localStorage.removeItem("surfaceData");
    localStorage.removeItem("viewer3D_sliceX");
    localStorage.removeItem("viewer3D_sliceY");
    localStorage.removeItem("viewer3D_activeSlice");
    localStorage.removeItem("viewer3D_showSlice");
    setSurface([]);
    setSliceX(0);
    setSliceY(0);
    setActiveSlice("x");
    setShowSlice(false);
  }

  const rows = surface.length;
  const cols = surface[0]?.length || 0;

  return (
    <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", background: "#f4f6fb", padding: 10 }}>
      {/* Top Buttons (above Canvas in stacking) */}
      <div style={{ textAlign: "center", marginBottom: 10, position: "sticky", top: 0, zIndex: 10, background: "#f4f6fb" }}>
        <input type="file" accept=".csv" ref={fileInput} style={{ display: "none" }} onChange={handleLoad} />
        <button
          onClick={() => fileInput.current.click()}
          style={{ margin: 6, padding: 10, background: "#2563eb", color: "#fff", borderRadius: 8 }}
        >
          {surface.length > 0 ? "Load New Data" : "Load CSV File"}
        </button>

        {/* Slice selector (mutually exclusive) */}
        <button
          onClick={() => setActiveSlice("x")}
          style={{
            margin: 6, padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
            color: activeSlice === "x" ? "#fff" : "#111827",
            background: activeSlice === "x" ? "#2563eb" : "#e5e7eb",
            border: activeSlice === "x" ? "none" : "1px solid #cbd5e1"
          }}
          aria-pressed={activeSlice === "x"}
        >
          X Slice
        </button>
        <button
          onClick={() => setActiveSlice("y")}
          style={{
            margin: 6, padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
            color: activeSlice === "y" ? "#fff" : "#111827",
            background: activeSlice === "y" ? "#2563eb" : "#e5e7eb",
            border: activeSlice === "y" ? "none" : "1px solid #cbd5e1"
          }}
          aria-pressed={activeSlice === "y"}
        >
          Y Slice
        </button>

        {/* Show/hide current slice plane */}
        <button
          onClick={() => setShowSlice(s => !s)}
          style={{
            margin: 6, padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
            color: showSlice ? "#fff" : "#111827",
            background: showSlice ? "#059669" : "#d1fae5",
            border: showSlice ? "none" : "1px solid #34d399"
          }}
          aria-pressed={showSlice}
        >
          {showSlice ? "Hide Slice" : "Show Slice"}
        </button>

        <button
          onClick={() => setResetView(prev => !prev)}
          style={{ margin: 6, padding: 10, background: "#6b7280", color: "#fff", borderRadius: 8 }}
        >
          Reset View
        </button>
        <button
          onClick={clearAllData}
          style={{ margin: 6, padding: 10, background: "#dc2626", color: "#fff", borderRadius: 8 }}
        >
          Clear All Data
        </button>
      </div>

      {/* Slider for active slice */}
      {surface.length > 0 && showSlice && (
        <div style={{ marginBottom: 10, textAlign: "center" }}>
          {activeSlice === "x" && (
            <>
              <label style={{ color: "#111827", fontWeight: 600 }}>
                Slice Position (X): {sliceX} / {Math.max(0, cols - 1)}
              </label>
              <br />
              <input
                type="range"
                min={0}
                max={Math.max(0, cols - 1)}
                value={sliceX}
                onChange={onChangeSliceX}
                style={{ width: "100%" }}
              />
            </>
          )}
          {activeSlice === "y" && (
            <>
              <label style={{ color: "#111827", fontWeight: 600 }}>
                Slice Position (Y): {sliceY} / {Math.max(0, rows - 1)}
              </label>
              <br />
              <input
                type="range"
                min={0}
                max={Math.max(0, rows - 1)}
                value={sliceY}
                onChange={onChangeSliceY}
                style={{ width: "100%" }}
              />
            </>
          )}
        </div>
      )}

      {/* 3D Viewer */}
      <Surface3DMesh
        surface={surface}
        sliceX={sliceX}
        sliceY={sliceY}
        showSlice={showSlice}
        activeSlice={activeSlice}
        resetSignal={resetView}
      />
    </div>
  );
}
