import React from "react";
import ProfileViewer from "../components/ProfileViewer";
import { useScanData } from "../components/ScanDataContext";

export default function CompareDataPage() {
  const {
    compareLeftScans, setCompareLeftScans,
    compareRightScans, setCompareRightScans,

    leftCurrent, setLeftCurrent,
    rightCurrent, setRightCurrent,

    leftZoom, setLeftZoom,
    rightZoom, setRightZoom,

    leftPan, setLeftPan,
    rightPan, setRightPan,

    leftMeasuring, setLeftMeasuring,
    rightMeasuring, setRightMeasuring,

    leftMeasureIdx, setLeftMeasureIdx,
    rightMeasureIdx, setRightMeasureIdx,

    leftMeasureHIdx, setLeftMeasureHIdx,
    rightMeasureHIdx, setRightMeasureHIdx
  } = useScanData();

  // Per-viewer point measure
  const [leftPointMeasure, setLeftPointMeasure] = React.useState(false);
  const [rightPointMeasure, setRightPointMeasure] = React.useState(false);

  const [locked, setLocked] = React.useState(false);

  const sync = (setA, setB) => (v) => { setA(v); setB(v); };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${locked ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"}`}
          onClick={() => setLocked(l => !l)}
        >
          {locked ? "Unlock Compare" : "Lock Compare"}
        </button>
      </div>

      {/* Sliders with labels */}
      {!locked && (
        <div className="flex justify-around mb-4">
          <div className="text-center w-[40%]">
            {compareLeftScans.length > 1 && (
              <>
                <div className="mb-1 text-white text-sm">
                  {leftCurrent + 1} / {compareLeftScans.length}
                  {compareLeftScans[leftCurrent]?.timestamp != null && (
                    <> — {compareLeftScans[leftCurrent].timestamp}</>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={compareLeftScans.length - 1}
                  value={leftCurrent}
                  onChange={e => setLeftCurrent(Number(e.target.value))}
                  className="w-full"
                />
              </>
            )}
          </div>
          <div className="text-center w-[40%]">
            {compareRightScans.length > 1 && (
              <>
                <div className="mb-1 text-white text-sm">
                  {rightCurrent + 1} / {compareRightScans.length}
                  {compareRightScans[rightCurrent]?.timestamp != null && (
                    <> — {compareRightScans[rightCurrent].timestamp}</>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={compareRightScans.length - 1}
                  value={rightCurrent}
                  onChange={e => setRightCurrent(Number(e.target.value))}
                  className="w-full"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Viewers */}
      <div className="flex flex-wrap justify-center gap-8">
        <ProfileViewer
          scans={compareLeftScans}
          current={leftCurrent}
          setCurrent={locked ? sync(setLeftCurrent, setRightCurrent) : setLeftCurrent}
          zoom={leftZoom}
          setZoom={locked ? sync(setLeftZoom, setRightZoom) : setLeftZoom}
          pan={leftPan}
          setPan={locked ? sync(setLeftPan, setRightPan) : setLeftPan}
          measuring={leftMeasuring}
          setMeasuring={locked ? sync(setLeftMeasuring, setRightMeasuring) : setLeftMeasuring}
          measureIdx={leftMeasureIdx}
          setMeasureIdx={locked ? sync(setLeftMeasureIdx, setRightMeasureIdx) : setLeftMeasureIdx}
          measureHIdx={leftMeasureHIdx}
          setMeasureHIdx={locked ? sync(setLeftMeasureHIdx, setRightMeasureHIdx) : setLeftMeasureHIdx}
          onLoad={setCompareLeftScans}
          withFileLoader
          withMeasurementDisplay
          pointMeasureMode={leftPointMeasure}
          setPointMeasureMode={locked ? sync(setLeftPointMeasure, setRightPointMeasure) : setLeftPointMeasure}
        />

        <ProfileViewer
          scans={compareRightScans}
          current={rightCurrent}
          setCurrent={locked ? sync(setLeftCurrent, setRightCurrent) : setRightCurrent}
          zoom={rightZoom}
          setZoom={locked ? sync(setLeftZoom, setRightZoom) : setRightZoom}
          pan={rightPan}
          setPan={locked ? sync(setLeftPan, setRightPan) : setRightPan}
          measuring={rightMeasuring}
          setMeasuring={locked ? sync(setLeftMeasuring, setRightMeasuring) : setRightMeasuring}
          measureIdx={rightMeasureIdx}
          setMeasureIdx={locked ? sync(setLeftMeasureIdx, setRightMeasureIdx) : setRightMeasureIdx}
          measureHIdx={rightMeasureHIdx}
          setMeasureHIdx={locked ? sync(setLeftMeasureHIdx, setRightMeasureHIdx) : setRightMeasureHIdx}
          onLoad={setCompareRightScans}
          withFileLoader
          withMeasurementDisplay
          pointMeasureMode={rightPointMeasure}
          setPointMeasureMode={locked ? sync(setLeftPointMeasure, setRightPointMeasure) : setRightPointMeasure}
        />
      </div>
    </div>
  );
}
