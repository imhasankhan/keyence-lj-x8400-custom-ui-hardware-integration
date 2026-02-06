// File: pages/ThreeDDataPage.jsx
import React from "react";
import Viewer3D from "../components/Viewer3D";
import ProfileViewer from "../components/ProfileViewer";

export default function ThreeDDataPage() {
  // The slice profile coming from Viewer3D (z array)
  const [sliceZ, setSliceZ] = React.useState([]);
  const [sliceAxis, setSliceAxis] = React.useState("x"); // 'x' or 'y'

  // Local measurement states for the ProfileViewer on the right
  const [current, setCurrent] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState(0);
  const [measuring, setMeasuring] = React.useState(false);
  const [measureIdx, setMeasureIdx] = React.useState([10, 30]);
  const [measureHIdx, setMeasureHIdx] = React.useState([0, 1]);
  const [pointMeasureMode, setPointMeasureMode] = React.useState(false);

  // Build a "scans" array compatible with ProfileViewer.
  // We keep a single scan whose z = sliceZ.
  const scans = React.useMemo(
    () => (sliceZ && sliceZ.length ? [{ timestamp: 0, z: sliceZ }] : []),
    [sliceZ]
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4">
      {/* Two-column layout: 3D left, 2D slice right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_720px] gap-6">
        {/* LEFT: 3D viewer */}
        <div className="w-full">
          <Viewer3D
            onSliceChange={(zArray, axis) => {
              setSliceZ(Array.isArray(zArray) ? zArray : []);
              setSliceAxis(axis || "x");
              // reset the 2D viewer pan/zoom to keep things sane when switching slices
              setZoom(1); setPan(0); setCurrent(0);
            }}
          />
        </div>

        {/* RIGHT: Single 2D chart using ProfileViewer */}
        <div className="w-full">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm text-gray-100 font-medium">
              Active Slice: {sliceAxis.toUpperCase()}
            </span>
          </div>

          <ProfileViewer
            scans={scans}
            current={current}
            setCurrent={setCurrent}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            measuring={measuring}
            setMeasuring={setMeasuring}
            measureIdx={measureIdx}
            setMeasureIdx={setMeasureIdx}
            measureHIdx={measureHIdx}
            setMeasureHIdx={setMeasureHIdx}
            withMeasurementDisplay
            pointMeasureMode={pointMeasureMode}
            setPointMeasureMode={setPointMeasureMode}
            // we don't want file loading here
            withFileLoader={false}
            // ProfileViewer already draws left Y, bottom X, ticks, units = mm
          />
        </div>
      </div>
    </div>
  );
}
