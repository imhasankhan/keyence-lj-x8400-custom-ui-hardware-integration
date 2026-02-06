import React from "react";
import ProfileViewer from "../components/ProfileViewer";
import { useScanData } from "../components/ScanDataContext";

export default function CapturedDataPage() {
  const {
    capturedScans, setCapturedScans,
    capturedCurrent, setCapturedCurrent,
    capturedZoom, setCapturedZoom,
    capturedPan, setCapturedPan,
    capturedMeasuring, setCapturedMeasuring,
    capturedMeasureIdx, setCapturedMeasureIdx,
    capturedMeasureHIdx, setCapturedMeasureHIdx
  } = useScanData();

  const [pointMeasureMode, setPointMeasureMode] = React.useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Profile viewer */}
      <ProfileViewer
        scans={capturedScans}
        current={capturedCurrent}
        setCurrent={setCapturedCurrent}
        zoom={capturedZoom}
        setZoom={setCapturedZoom}
        pan={capturedPan}
        setPan={setCapturedPan}
        measuring={capturedMeasuring}
        setMeasuring={setCapturedMeasuring}
        measureIdx={capturedMeasureIdx}
        setMeasureIdx={setCapturedMeasureIdx}
        measureHIdx={capturedMeasureHIdx}
        setMeasureHIdx={setCapturedMeasureHIdx}
        onLoad={(data) => {
          setCapturedScans(data);
          setCapturedCurrent(0);
        }}
        withFileLoader
        withMeasurementDisplay
        pointMeasureMode={pointMeasureMode}
        setPointMeasureMode={setPointMeasureMode}
      />

      {/* Scan slider (no label) */}
      {capturedScans.length > 1 && (
  <div className="w-1/2 mt-4">
    {/* ✅ Scan index (and timestamp if available) */}
    <div className="mb-1 text-center text-sm text-white-700">
      Scan {capturedCurrent + 1} / {capturedScans.length}
      {capturedScans[capturedCurrent]?.timestamp != null &&
        <> — {capturedScans[capturedCurrent].timestamp}</>}
    </div>

    <input
      type="range"
      min={0}
      max={capturedScans.length - 1}
      value={capturedCurrent}
      onChange={e => setCapturedCurrent(Number(e.target.value))}
      className="w-full"
    />
  </div>
)}

    </div>
  );
}
