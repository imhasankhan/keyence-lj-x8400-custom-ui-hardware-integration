import React, { createContext, useContext, useState } from "react";

const ScanDataContext = createContext();

export function useScanData() {
  return useContext(ScanDataContext);
}

export function ScanDataProvider({ children }) {
  // Surface 3D mesh data (session only — not persisted)
  const [surface, setSurface] = useState([]);

  // Global scan data (non-persistent)
  const [threeDScans, setThreeDScans] = useState([]);
  const [capturedScans, setCapturedScans] = useState([]);
  const [compareLeftScans, setCompareLeftScans] = useState([]);
  const [compareRightScans, setCompareRightScans] = useState([]);

  // Compare page state
  const [leftCurrent, setLeftCurrent] = useState(0);
  const [rightCurrent, setRightCurrent] = useState(0);
  const [leftZoom, setLeftZoom] = useState(1);
  const [rightZoom, setRightZoom] = useState(1);
  const [leftPan, setLeftPan] = useState(0);
  const [rightPan, setRightPan] = useState(0);
  const [leftMeasuring, setLeftMeasuring] = useState(false);
  const [rightMeasuring, setRightMeasuring] = useState(false);
  const [leftMeasureIdx, setLeftMeasureIdx] = useState([10, 30]);
  const [rightMeasureIdx, setRightMeasureIdx] = useState([10, 30]);
  const [leftMeasureHIdx, setLeftMeasureHIdx] = useState([0, 1]);
  const [rightMeasureHIdx, setRightMeasureHIdx] = useState([0, 1]);

  // Captured page state
  const [capturedCurrent, setCapturedCurrent] = useState(0);
  const [capturedZoom, setCapturedZoom] = useState(1);
  const [capturedPan, setCapturedPan] = useState(0);
  const [capturedMeasuring, setCapturedMeasuring] = useState(false);
  const [capturedMeasureIdx, setCapturedMeasureIdx] = useState([10, 30]);
  const [capturedMeasureHIdx, setCapturedMeasureHIdx] = useState([0, 1]);

  return (
    <ScanDataContext.Provider
      value={{
        surface, setSurface,
        threeDScans, setThreeDScans,
        capturedScans, setCapturedScans,
        compareLeftScans, setCompareLeftScans,
        compareRightScans, setCompareRightScans,

        // Compare
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
        rightMeasureHIdx, setRightMeasureHIdx,

        // Captured
        capturedCurrent, setCapturedCurrent,
        capturedZoom, setCapturedZoom,
        capturedPan, setCapturedPan,
        capturedMeasuring, setCapturedMeasuring,
        capturedMeasureIdx, setCapturedMeasureIdx,
        capturedMeasureHIdx, setCapturedMeasureHIdx,
      }}
    >
      {children}
    </ScanDataContext.Provider>
  );
}
