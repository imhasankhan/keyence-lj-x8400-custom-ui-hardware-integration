import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";

const DEFAULT_MEASURE_IDX = [10, 30];
const DEFAULT_MEASURE_H_IDX = [0, 1];
const X_RANGE_MM = 240; // fixed horizontal span in mm

// --- tiny legend helpers ---
function LegendLine({ color, dashed = false, opacity = 1 }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 14,
        height: 0,
        borderTop: `3px ${dashed ? "dashed" : "solid"} ${color}`,
        opacity,
        transform: "translateY(-1px)",
      }}
    />
  );
}
function LegendDot({ color }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}
function CellLabel({ children, before }) {
  return (
    <div className="flex items-center gap-2">
      {before}
      <span>{children}</span>
    </div>
  );
}

export default function ProfileViewer({
  scans = [],
  current = 0,
  setCurrent,
  measureIdx,
  setMeasureIdx,
  measureHIdx,
  setMeasureHIdx,
  zoom = 1,
  setZoom,
  pan = 0,
  setPan,
  measuring = false,
  setMeasuring,
  onLoad,
  withFileLoader = false,
  withMeasurementDisplay = false,
  pointMeasureMode = false,
  setPointMeasureMode, // parent-provided setter
}) {
  const fileInput = useRef();
  const graphBox = useRef();

  const [clickedPoints, setClickedPoints] = useState([]);

  useEffect(() => {
    if (!pointMeasureMode) setClickedPoints([]);
  }, [pointMeasureMode]);

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const csv = evt.target.result;
      const [header, ...lines] = csv.trim().split("\n");
      const data = lines.map((line) => {
        const [timestamp, ...zs] = line.split(",");
        return { timestamp: Number(timestamp), z: zs.map(Number) };
      });
      onLoad && onLoad(data);
      setCurrent?.(0);
    };
    reader.readAsText(file);
  };

  const [idxA, idxB] = measureIdx || DEFAULT_MEASURE_IDX;
  const [zA, zB] = measureHIdx || DEFAULT_MEASURE_H_IDX;

  const profile = scans[current]?.z || [];
  const n = profile.length;

  // ---- Pan / Zoom window ----
  const win = Math.max(1, Math.round(n / Math.max(1, zoom)));
  const panMax = Math.max(0, n - win);
  const panClamped = Math.max(0, Math.min(pan, panMax));

  // ---- Shift Z so Y starts at 0 mm ----
  let shiftedProfile = [];
  let windowData = [];
  let zOffset = 0;
  if (n > 0) {
    const rawZMin = Math.min(...profile);
    zOffset = rawZMin < 0 ? -rawZMin : 0;
    shiftedProfile = profile.map((z) => z + zOffset);
    windowData = shiftedProfile.slice(panClamped, panClamped + win);
  }

  // ---- Y range / ticks ----
  const zMin = 0;
  const zMax = shiftedProfile.length > 0 ? Math.max(...shiftedProfile, 8) : 8;
  const zPad = 2;
  const zTicks = 5;
  const ySpan = (zMax + zPad - zMin) || 1;
  const zStep = ySpan / (zTicks - 1);

  // ---- SVG geometry ----
  const SVG_W = 680;
  const SVG_H = 260;
  const M_LEFT = 48;
  const M_RIGHT = 10;
  const M_TOP = 10;
  const M_BOTTOM = 34;
  const DRAW_W = SVG_W - M_LEFT - M_RIGHT;
  const DRAW_H = SVG_H - M_TOP - M_BOTTOM;

  // ---- X/Y mapping ----
  const stepX = win > 1 ? DRAW_W / (win - 1) : 0;
  const getScreenX = (idx) => M_LEFT + (idx - panClamped) * stepX;
  const getScreenY = (z) => M_TOP + DRAW_H - ((z - zMin) / ySpan) * DRAW_H;
  const idxInWindow = (i) => i >= panClamped && i < panClamped + win;

  // ---- X in mm ----
  const xStepMm = n > 1 ? X_RANGE_MM / (n - 1) : 0;
  const xMinMm = panClamped * xStepMm;
  const xMaxMm = (panClamped + win - 1) * xStepMm;

  // X ticks every 20 mm
  const xTickEvery = 20;
  const firstTickMm = Math.ceil(xMinMm / xTickEvery) * xTickEvery;
  const xTicksMm = [];
  for (let mm = firstTickMm; mm <= xMaxMm + 1e-6; mm += xTickEvery) xTicksMm.push(mm);

  // ---- Drag / move state ----
  const draggingHandle = useRef(null);
  const draggingHHandle = useRef(null);
  const [draggingPan, setDraggingPan] = useState(false);
  const dragStartX = useRef(0);
  const panStart = useRef(0);

  // Ensure horizontal orange lines are initialized inside range
  useEffect(() => {
    if (
      measuring &&
      setMeasureHIdx &&
      profile.length > 0 &&
      (zA === zB || !Number.isFinite(zA) || !Number.isFinite(zB))
    ) {
      setMeasureHIdx([zMin + 0.2 * (zMax - zMin), zMax - 0.2 * (zMax - zMin)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuring, profile.length]);

  const onGraphMouseDown = (e) => {
    if (!measuring) {
      setDraggingPan(true);
      dragStartX.current = e.clientX;
      panStart.current = panClamped;
    }
  };

  const onGraphMouseMove = (e) => {
    const rect = graphBox.current.getBoundingClientRect();
    if (draggingHandle.current !== null && measuring && profile.length) {
      const px = e.clientX - rect.left - M_LEFT;
      const denom = stepX || 1;
      let idx = Math.round(panClamped + px / denom);
      idx = Math.max(panClamped, Math.min(panClamped + win - 1, idx));
      setMeasureIdx?.((arr) => {
        const copy = [...arr];
        copy[draggingHandle.current] = idx;
        return copy;
      });
    } else if (draggingHHandle.current !== null && measuring && profile.length) {
      const py = e.clientY - rect.top;
      let z = zMax + zPad - ((py - M_TOP) / DRAW_H) * ySpan;
      z = Math.max(zMin, Math.min(zMax + zPad, z));
      setMeasureHIdx?.((arr) => {
        const copy = [...arr];
        copy[draggingHHandle.current] = z;
        return copy;
      });
    } else if (draggingPan && profile.length) {
      const dx = e.clientX - dragStartX.current;
      const denom = stepX || 1;
      let panNew = panStart.current - Math.round(dx / denom);
      panNew = Math.max(0, Math.min(panMax, panNew));
      setPan?.(panNew);
    }
  };

  const onGraphMouseUp = () => {
    draggingHandle.current = null;
    draggingHHandle.current = null;
    setDraggingPan(false);
  };

  // Keep red handles in view during zoom by nudging pan if needed
  const keepHandlesVisible = (newPan, newWin) => {
    if (!measuring) return newPan;
    const a = idxA ?? 0;
    const b = idxB ?? 0;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    let p = newPan;
    if (lo < p) p = lo;
    if (hi > p + newWin - 1) p = hi - (newWin - 1);
    p = Math.max(0, Math.min(n - newWin, p));
    return p;
  };

  // Wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault(); // don't let the page scroll/zoom here
      if (!profile.length) return;

      let newZoom = zoom + (e.deltaY < 0 ? 1 : -1);
      newZoom = Math.max(1, Math.min(8, newZoom));
      if (newZoom === zoom) return;

      const rect = graphBox.current.getBoundingClientRect();
      const px = e.clientX - rect.left - M_LEFT;
      const frac = Math.max(0, Math.min(1, DRAW_W ? px / DRAW_W : 0));

      const oldWin = Math.round(n / zoom);
      const newWin = Math.round(n / newZoom);
      const idxUnderCursor = pan + Math.round(frac * Math.max(0, oldWin - 1));
      let newPan = Math.round(idxUnderCursor - frac * Math.max(0, newWin - 1));
      newPan = Math.max(0, Math.min(n - newWin, newPan));

      // ensure red handles remain visible
      newPan = keepHandlesVisible(newPan, newWin);

      setZoom?.(newZoom);
      setPan?.(newPan);
    },
    [profile.length, zoom, setZoom, pan, setPan, n, M_LEFT, DRAW_W, measuring, idxA, idxB]
  );

  // Non-passive wheel listener so preventDefault works everywhere
  useEffect(() => {
    const el = graphBox.current;
    if (!el) return;
    const wheel = (ev) => handleWheel(ev);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [handleWheel]);

  const handleGraphClick = (e) => {
    if (!pointMeasureMode || !profile.length) return;
    const rect = graphBox.current.getBoundingClientRect();
    const px = e.clientX - rect.left - M_LEFT;
    const denom = stepX || 1;
    const idx = Math.round(panClamped + px / denom);
    const clampedIdx = Math.max(panClamped, Math.min(panClamped + win - 1, idx));
    const x = clampedIdx;
    const z = shiftedProfile[clampedIdx] ?? 0;
    setClickedPoints((prev) => [...prev, { x, z }].slice(-2));
  };

  // ---- Metrics (mm) ----
  const measureX_idx = Math.abs((idxA ?? 0) - (idxB ?? 0));
  const measureX_mm = measureX_idx * xStepMm;
  const measureH_mm = Math.abs((zA ?? 0) - (zB ?? 0));

  const curveDistance = (arr, i0, i1) => {
    if (!Array.isArray(arr) || arr.length < 2) return null;
    const start = Math.max(0, Math.min(i0, i1));
    const end = Math.min(arr.length - 1, Math.max(i0, i1));
    let sum = 0;
    for (let i = start; i < end; i++) {
      const z0 = arr[i];
      const z1 = arr[i + 1];
      if (!Number.isFinite(z0) || !Number.isFinite(z1)) continue;
      const dz = z1 - z0; // mm
      sum += Math.hypot(xStepMm, dz); // mm
    }
    return sum;
  };

  const useClicked = pointMeasureMode && clickedPoints.length === 2;
  const rangeStart = useClicked
    ? Math.round(Math.min(clickedPoints[0].x, clickedPoints[1].x))
    : Math.min(idxA ?? 0, idxB ?? 0);
  const rangeEnd = useClicked
    ? Math.round(Math.max(clickedPoints[0].x, clickedPoints[1].x))
    : Math.max(idxA ?? 0, idxB ?? 0);

  const pathDistance_mm = useMemo(() => {
    if (!shiftedProfile.length) return null;
    return curveDistance(shiftedProfile, rangeStart, rangeEnd);
  }, [shiftedProfile, rangeStart, rangeEnd]);

  let minZInRange = null,
    maxZInRange = null;
  if (shiftedProfile.length && Number.isFinite(rangeStart) && Number.isFinite(rangeEnd)) {
    const selected = shiftedProfile.slice(rangeStart, rangeEnd + 1);
    if (selected.length) {
      minZInRange = Math.min(...selected);
      maxZInRange = Math.max(...selected);
    }
  }

  // Point-to-point metrics
  let p2pStraight_mm = null,
    p2pAngle_deg = null,
    p2pPath_mm = null;
  if (clickedPoints.length === 2) {
    const i0 = Math.round(clickedPoints[0].x);
    const i1 = Math.round(clickedPoints[1].x);
    const z0 = shiftedProfile[i0] ?? clickedPoints[0].z;
    const z1 = shiftedProfile[i1] ?? clickedPoints[1].z;
    const dx_mm = (i1 - i0) * xStepMm;
    const dz_mm = z1 - z0;
    p2pStraight_mm = Math.hypot(dx_mm, dz_mm);
    p2pAngle_deg = (Math.atan2(dz_mm, dx_mm) * 180) / Math.PI;
    p2pPath_mm = curveDistance(shiftedProfile, i0, i1);
  }

  const clickedCurvePoints = useMemo(() => {
    if (!(pointMeasureMode && clickedPoints.length === 2)) return null;
    if (!shiftedProfile.length) return null;
    const start = Math.round(Math.min(clickedPoints[0].x, clickedPoints[1].x));
    const end = Math.round(Math.max(clickedPoints[0].x, clickedPoints[1].x));
    const pts = [];
    for (let i = start; i <= end; i++) {
      const z = shiftedProfile[i];
      if (!Number.isFinite(z)) continue;
      pts.push(`${getScreenX(i)},${getScreenY(z)}`);
    }
    return pts.join(" ");
  }, [pointMeasureMode, clickedPoints, shiftedProfile, panClamped, win, zMin, zMax, zPad]); // eslint-disable-line

  // --- Toggle handlers (mutually exclusive) ---
  const toggleMeasuring = () => {
    if (setMeasuring) {
      setMeasuring((m) => {
        const next = !m;
        if (next) setPointMeasureMode?.(false);
        return next;
      });
    }
  };
  const togglePointMeasure = () => {
    setPointMeasureMode?.((pm) => {
      const next = !pm;
      if (next) setMeasuring?.(false);
      if (!next) setClickedPoints([]);
      return next;
    });
  };

  return (
    <div>
      {/* Top controls (inline buttons) */}
      <div className="flex gap-2 mb-2">
        {withFileLoader && (
          <>
            <input
              type="file"
              accept=".csv"
              ref={fileInput}
              style={{ display: "none" }}
              onChange={handleLoad}
            />
            <button
              onClick={() => fileInput.current.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Load Data
            </button>
          </>
        )}

        <button
          className={`px-4 py-2 rounded ${
            measuring ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"
          }`}
          onClick={toggleMeasuring}
          disabled={!profile.length}
        >
          {measuring ? "Measure Off" : "Measure On"}
        </button>

        <button
          className={`px-4 py-2 rounded ${
            pointMeasureMode ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-800"
          }`}
          onClick={togglePointMeasure}
          disabled={!profile.length}
        >
          {pointMeasureMode ? "Point Measure Off" : "Point Measure On"}
        </button>
      </div>

      {/* Graph container */}
      <div
        ref={graphBox}
        className="relative bg-white border rounded shadow"
        style={{
          width: SVG_W,
          height: SVG_H,
          cursor:
            profile.length && (measuring || pointMeasureMode)
              ? "crosshair"
              : profile.length && zoom > 1
              ? "grab"
              : "default",
          overflow: "hidden",
          userSelect: "none",
        }}
        onMouseDown={profile.length ? onGraphMouseDown : undefined}
        onMouseMove={profile.length ? onGraphMouseMove : undefined}
        onMouseUp={profile.length ? onGraphMouseUp : undefined}
        onMouseLeave={profile.length ? onGraphMouseUp : undefined}
        onClick={handleGraphClick}
      >
        {profile.length > 0 ? (
          <svg width={SVG_W} height={SVG_H} style={{ position: "absolute", top: 0, left: 0 }}>
            {/* Left Y axis */}
            <line x1={M_LEFT} x2={M_LEFT} y1={M_TOP} y2={M_TOP + DRAW_H} stroke="#222" />
            {[...Array(zTicks)].map((_, i) => {
              const val = zMin + i * zStep;
              const y = getScreenY(val);
              return (
                <g key={`yt-${i}`}>
                  <line x1={M_LEFT} x2={M_LEFT - 6} y1={y} y2={y} stroke="#222" />
                  <text x={M_LEFT - 8} y={y + 4} fontSize="10" fill="#333" textAnchor="end">
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}
            <text x={M_LEFT - 34} y={M_TOP + 12} fontSize="11" fill="#333" textAnchor="end">
              .
            </text>

            {/* Bottom X axis (flush) */}
            <line x1={M_LEFT} x2={M_LEFT + DRAW_W} y1={M_TOP + DRAW_H} y2={M_TOP + DRAW_H} stroke="#222" />
            {xTicksMm.map((mm, i) => {
              const idxFloat = xStepMm > 0 ? mm / xStepMm : 0;
              const x = getScreenX(idxFloat);
              return (
                <g key={`xt-${i}`}>
                  <line x1={x} x2={x} y1={M_TOP + DRAW_H} y2={M_TOP + DRAW_H + 6} stroke="#222" />
                  <text x={x} y={M_TOP + DRAW_H + 18} fontSize="10" fill="#333" textAnchor="middle">
                    {mm.toFixed(0)}
                  </text>
                </g>
              );
            })}
            <text x={M_LEFT + DRAW_W} y={M_TOP + DRAW_H + 32} fontSize="11" fill="#333" textAnchor="end">
              .
            </text>

            {/* Data polyline */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={windowData
                .map((z, i) => `${M_LEFT + i * (stepX || 0)},${getScreenY(z)}`)
                .join(" ")}
            />

            {/* Vertical handles (red) */}
            {measuring && idxInWindow(idxA) && (
              <line
                x1={getScreenX(idxA)}
                y1={M_TOP}
                x2={getScreenX(idxA)}
                y2={M_TOP + DRAW_H}
                stroke="red"
                strokeWidth={2}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingHandle.current = 0;
                }}
                style={{ cursor: "ew-resize" }}
              />
            )}
            {measuring && idxInWindow(idxB) && (
              <line
                x1={getScreenX(idxB)}
                y1={M_TOP}
                x2={getScreenX(idxB)}
                y2={M_TOP + DRAW_H}
                stroke="red"
                strokeWidth={2}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingHandle.current = 1;
                }}
                style={{ cursor: "ew-resize" }}
              />
            )}

            {/* Horizontal handles (orange) */}
            {measuring && Number.isFinite(zA) && (
              <line
                x1={M_LEFT}
                y1={getScreenY(zA)}
                x2={M_LEFT + DRAW_W}
                y2={getScreenY(zA)}
                stroke="orange"
                strokeWidth={2}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingHHandle.current = 0;
                }}
                style={{ cursor: "ns-resize" }}
              />
            )}
            {measuring && Number.isFinite(zB) && (
              <line
                x1={M_LEFT}
                y1={getScreenY(zB)}
                x2={M_LEFT + DRAW_W}
                y2={getScreenY(zB)}
                stroke="orange"
                strokeWidth={2}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingHHandle.current = 1;
                }}
                style={{ cursor: "ns-resize" }}
              />
            )}

            {/* Clicked points + dashed curve/chord */}
            {clickedPoints.map((p, i) => (
              <circle
                key={i}
                cx={getScreenX(p.x)}
                cy={getScreenY(p.z)}
                r={5}
                fill={i === 0 ? "blue" : "green"}
              />
            ))}
            {clickedPoints.length === 2 && (
              <>
                {pointMeasureMode && (
                  <polyline
                    fill="none"
                    stroke="purple"
                    strokeWidth="2"
                    strokeDasharray="4"
                    points={clickedCurvePoints || ""}
                  />
                )}
                <line
                  x1={getScreenX(clickedPoints[0].x)}
                  y1={getScreenY(clickedPoints[0].z)}
                  x2={getScreenX(clickedPoints[1].x)}
                  y2={getScreenY(clickedPoints[1].z)}
                  stroke="purple"
                  strokeWidth={2}
                  strokeDasharray="4"
                  strokeOpacity="0.25"
                />
              </>
            )}
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
            No data loaded
          </div>
        )}
      </div>

      {/* Measurement table with legends */}
      <div className="mt-3" style={{ width: SVG_W }}>
        <div className="grid grid-cols-2 border border-gray-700 rounded overflow-hidden">
          <div className="px-3 py-2 font-semibold bg-gray-900 text-white border-b border-gray-700">
            Metric
          </div>
          <div className="px-3 py-2 font-semibold bg-gray-900 text-white border-b border-gray-700">
            Value
          </div>

          {/* Status */}
          <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">Status</div>
          <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
            {measuring || (pointMeasureMode && clickedPoints.length === 2) ? "On" : "Measure Off"}
          </div>

          {/* Handle-based rows */}
          {measuring && profile.length > 0 && (
            <>
              {/* Visible X range */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="#222" />}>Visible X (mm)</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {xMinMm.toFixed(1)} – {xMaxMm.toFixed(1)}
              </div>

              {/* ΔX (red vertical) */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="red" />}>ΔX (red lines)</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {measureX_mm.toFixed(2)} mm
              </div>

              {/* Z@A / Z@B */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="orange" />}>Z@A / Z@B</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {(zA ?? 0).toFixed(2)} mm / {(zB ?? 0).toFixed(2)} mm
              </div>

              {/* ΔZ (orange horizontal) */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="orange" />}>ΔZ (orange lines)</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {measureH_mm.toFixed(2)} mm
              </div>

              {withMeasurementDisplay && (
                <>
                  {/* Path distance (curve - purple dashed) */}
                  <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                    <CellLabel before={<LegendLine color="purple" dashed />}>
                      Path Distance (curve)
                    </CellLabel>
                  </div>
                  <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                    {Number.isFinite(pathDistance_mm) ? pathDistance_mm.toFixed(2) : "--"} mm
                  </div>

                  {/* Z Min / Max */}
                  <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                    <CellLabel before={<LegendLine color="#2563eb" />}>Z Min / Max (range)</CellLabel>
                  </div>
                  <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                    {minZInRange != null ? minZInRange.toFixed(2) : "--"} mm /{" "}
                    {maxZInRange != null ? maxZInRange.toFixed(2) : "--"} mm
                  </div>
                </>
              )}
            </>
          )}

          {/* Clicked point-to-point rows */}
          {pointMeasureMode && clickedPoints.length === 2 && (
            <>
              {/* Point A */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendDot color="blue" />}>Point A (x, z)</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {(clickedPoints[0].x * xStepMm).toFixed(2)} mm, {clickedPoints[0].z.toFixed(2)} mm
              </div>

              {/* Point B */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendDot color="green" />}>Point B (x, z)</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {(clickedPoints[1].x * xStepMm).toFixed(2)} mm, {clickedPoints[1].z.toFixed(2)} mm
              </div>

              {/* Path Distance (clicked points) */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="purple" dashed />}>
                  Path Distance (curve)
                </CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {Number.isFinite(p2pPath_mm) ? p2pPath_mm.toFixed(2) : "--"} mm
              </div>

              {/* Straight Distance (chord - faint purple dashed) */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendLine color="purple" dashed opacity={0.35} />}>
                  Straight Distance
                </CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {Number.isFinite(p2pStraight_mm) ? p2pStraight_mm.toFixed(2) : "--"} mm
              </div>

              {/* Angle */}
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                <CellLabel before={<LegendDot color="#111827" />}>Angle</CellLabel>
              </div>
              <div className="px-3 py-2 bg-white text-gray-900 border-t border-gray-700">
                {Number.isFinite(p2pAngle_deg) ? p2pAngle_deg.toFixed(2) : "--"}°
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
