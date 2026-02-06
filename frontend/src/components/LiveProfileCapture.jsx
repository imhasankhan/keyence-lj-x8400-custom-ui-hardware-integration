import React, { useEffect, useRef, useState } from "react";

function SettingsModal({
  open,
  onClose,
  ip,
  setIp,
  port,
  setPort,
  sampleRate,
  setSampleRate,
  sampleInterval,
  setSampleInterval,
  status,
  setStatus
}) {
  const [pendingIp, setPendingIp] = useState(ip);
  const [pendingPort, setPendingPort] = useState(port);
  const [pendingSampleRate, setPendingSampleRate] = useState(sampleRate);
  const [pendingSampleInterval, setPendingSampleInterval] = useState(sampleInterval);

  useEffect(() => {
    if (open) {
      setPendingIp(ip);
      setPendingPort(port);
      setPendingSampleRate(sampleRate);
      setPendingSampleInterval(sampleInterval);
    }
  }, [open, ip, port, sampleRate, sampleInterval]);

  const handleSet = async () => {
    await fetch(`http://localhost:8000/set_sensor?ip=${pendingIp}&port=${pendingPort}`, {
      method: "POST",
    });
    setIp(pendingIp);
    setPort(pendingPort);
    setSampleRate(pendingSampleRate);
    setSampleInterval(pendingSampleInterval);
    setStatus();
  };

  const handleConnect = async () => {
    await fetch("http://localhost:8000/connect", { method: "POST" });
    setStatus();
  };

  const handleDisconnect = async () => {
    await fetch("http://localhost:8000/disconnect", { method: "POST" });
    setStatus();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 min-w-[360px] relative border border-gray-700">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-3xl font-bold text-gray-400 hover:text-white transition"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Sensor Settings</h2>

        {/* Input: IP */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-300">Sensor IP</label>
          <input
            className="border border-gray-600 bg-gray-800 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-blue-500"
            type="text"
            value={pendingIp}
            onChange={(e) => setPendingIp(e.target.value)}
          />
        </div>

        {/* Input: Port */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-300">Port</label>
          <input
            className="border border-gray-600 bg-gray-800 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-blue-500"
            type="number"
            value={pendingPort}
            onChange={(e) => setPendingPort(e.target.value)}
          />
        </div>

        {/* Input: Polling Rate */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-300">Polling Rate (ms)</label>
          <input
            className="border border-gray-600 bg-gray-800 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-blue-500"
            type="number"
            value={pendingSampleRate}
            onChange={(e) => setPendingSampleRate(Number(e.target.value))}
          />
        </div>

        {/* Input: Sample Interval */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-300">Sample Interval (ms)</label>
          <input
            className="border border-gray-600 bg-gray-800 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-blue-500"
            type="number"
            value={pendingSampleInterval}
            onChange={(e) => setPendingSampleInterval(Number(e.target.value))}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              status.connected
                ? "bg-green-700 text-white opacity-50 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleConnect}
            disabled={status.connected}
          >
            Connect
          </button>

          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              !status.connected
                ? "bg-red-700 text-white opacity-50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={handleDisconnect}
            disabled={!status.connected}
          >
            Disconnect
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold"
            onClick={handleSet}
          >
            Set
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center">
          <span
            className={`inline-block w-4 h-4 rounded-full mr-2 ${
              status.connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-gray-300">
            {status.connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LiveProfileCapture() {
  const [showSettings, setShowSettings] = useState(false);
  const [ip, setIp] = useState("192.168.0.1");
  const [port, setPort] = useState("24691");
  const [sampleRate, setSampleRate] = useState(200);
  const [sampleInterval, setSampleInterval] = useState(10);

  const [status, setStatusObj] = useState({ connected: false, ip: "192.168.0.1", port: 24691 });
  const fetchStatus = async () => {
    const res = await fetch("http://localhost:8000/status");
    setStatusObj(await res.json());
  };

  const [connected, setConnected] = useState(false);
  const [dataBlink, setDataBlink] = useState(false);
  const [profile, setProfile] = useState({ x: [], z: [] });
  const [scans, setScans] = useState([]);
  const maxZSeen = useRef(8);
  const lastSavedRef = useRef(0);

  const getDataMax = () =>
    profile.z.length ? Math.ceil(Math.max(...profile.z.map(z => Math.abs(z))) / 10) * 10 : 100;
  const [yMax, setYMax] = useState(100);
  const [xZoomFactor, setXZoomFactor] = useState(1);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setConnected(status.connected);
    setIp(status.ip);
    setPort(status.port);
  }, [status]);

  useEffect(() => {
    const poll = async () => {
      if (!connected) return;
      try {
        const res = await fetch("http://localhost:8000/profile");
        const data = await res.json();
        if (data?.status === "OK" && data.profile?.z) {
          const realX = data.profile?.x.map(x => (x * 20) + 240); // shift left so center becomes 0
          const rawZ = data.profile.z.map(z => z ?? 0);
          const minZ = Math.min(...rawZ);
          const z = rawZ.map(zVal => zVal - minZ); // shift up so min = 0
          setProfile({ x: realX, z });
          setDataBlink(true);
          setTimeout(() => setDataBlink(false), 100);
          const localMax = Math.max(...z.map(Math.abs));
          if (localMax > maxZSeen.current) maxZSeen.current = localMax;
        }
      } catch {
        setConnected(false);
      }
    };
    poll();
    const timer = setInterval(poll, sampleRate);
    return () => clearInterval(timer);
  }, [connected, sampleRate]);

  const [capturing, setCapturing] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (profile.z.length) {
      const dataMax = getDataMax();
      if (yMax < dataMax) setYMax(dataMax);
    }
  }, [profile.z]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (capturing && !paused && connected && profile.z.length) {
        const now = Date.now();
        if (now - lastSavedRef.current >= sampleInterval) {
          setScans(prev => [...prev, { timestamp: now, profile: profile.z }]);
          lastSavedRef.current = now;
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [capturing, paused, connected, profile, sampleInterval]);

  const handleExportCSV = () => {
    if (!scans.length) return;
    const n = scans[0].profile.length;
    const header = ["timestamp", ...Array(n).fill(0).map((_, i) => `z${i}`)].join(",");
    const rows = scans.map(s => [s.timestamp, ...s.profile.map(z => z?.toFixed(6) ?? "NaN")].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scan_capture.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStart = () => {
    setScans([]); setPaused(false); setCapturing(true); lastSavedRef.current = 0;
  };
  const handlePause = () => setPaused(p => !p);
  const handleStop = () => {
    setCapturing(false); setPaused(false);
    setTimeout(handleExportCSV, 300);
  };

  const handleZoomY = (delta) => {
    setYMax((current) => Math.max(10, current + delta));
  };
  const handleZoomHome = () => setYMax(getDataMax());

  const handleZoomX = (delta) => {
    setXZoomFactor(current => Math.max(0.1, current + delta));
  };
  const handleZoomXHome = () => setXZoomFactor(1);

  let zMin = 0;
  let zMax = yMax;

  let xMin = 0;
  let xMax = 240;

  let xCenter = 120; // center of 0–240 mm
  let xHalf = 120 / xZoomFactor;
  xMin = xCenter - xHalf;
  xMax = xCenter + xHalf;

  const zoomEnabled = connected && profile.z.length > 0;

  return (
    <div
      className="bg-white border rounded shadow p-4 mb-4"
      style={{ minHeight: "90vh", width: "100%", maxWidth: 1800, margin: "0 auto" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          <span className={`w-4 h-4 rounded-full ${dataBlink ? "bg-yellow-400 animate-ping" : "bg-gray-300"}`} />
        </div>
        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300" onClick={() => setShowSettings(true)}>Settings ⚙️</button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <button
          className={`px-4 py-1 rounded ${capturing ? "bg-gray-300" : "bg-green-500 text-white"}`}
          onClick={handleStart}
          disabled={capturing || !connected}
        >
          Start Capture
        </button>

        <button
          className={`px-4 py-1 rounded ${capturing ? "bg-red-500 text-white" : "bg-red-300 text-gray-700"}`}
          onClick={handleStop}
          disabled={!capturing}
        >
          Stop Capture
        </button>

        <button
          className={`px-4 py-1 rounded ${capturing ? (paused ? "bg-yellow-500 text-black" : "bg-yellow-700 text-white") : "bg-gray-300 text-gray-700"}`}
          onClick={handlePause}
          disabled={!capturing}
        >
          {paused ? "Resume" : "Pause"}
        </button>

        <button
          className="px-4 py-1 rounded bg-gray-600 text-white"
          onClick={handleExportCSV}
          disabled={!scans.length}
        >
          Export CSV
        </button>

        <div className="flex flex-col gap-1 ml-4 text-xs">
          <div className="flex gap-1">
            <button
              title="Zoom Y In"
              onClick={() => handleZoomY(-10)}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              Zoom Z+
            </button>

            <button
              title="Zoom Y Out"
              onClick={() => handleZoomY(10)}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              Zoom Z-
            </button>

            <button
              title="Reset Y"
              onClick={handleZoomHome}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              Z Home
            </button>
          </div>

          <div className="flex gap-1 mt-1">
            <button
              title="Zoom X In"
              onClick={() => handleZoomX(0.5)}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              Zoom X+
            </button>

            <button
              title="Zoom X Out"
              onClick={() => handleZoomX(-0.5)}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              Zoom X-
            </button>

            <button
              title="Reset X"
              onClick={handleZoomXHome}
              disabled={!zoomEnabled}
              className={`px-2 py-1 rounded border text-sm font-semibold transition
                ${zoomEnabled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-300 border-gray-400"
                  : "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"}`}
            >
              X Home
            </button>
          </div>
        </div>

        <span className="text-xs text-gray-500">
          {capturing
            ? (paused ? `Paused (${scans.length})` : `${scans.length} lines...`)
            : scans.length
              ? "Ready to download"
              : "Not capturing"}
        </span>
      </div>

      <SettingsModal
        {...{
          open: showSettings,
          onClose: () => setShowSettings(false),
          ip, setIp,
          port, setPort,
          sampleRate, setSampleRate,
          sampleInterval, setSampleInterval,
          status,
          setStatus: fetchStatus
        }}
      />

      <div style={{ width: "100%", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="100%" height={650} style={{ background: "#f4f6fb", borderRadius: 10, boxShadow: "0 2px 12px #0001" }}>
         {(() => {
  const chartLeftMargin = 90;
  const containerWidth = 0.75 * window.innerWidth; // 90% of screen width
  const chartWidth = containerWidth - chartLeftMargin - 30; // 30px right margin
  const chartHeight = 500;
  const axisTop = 50;
  const chartBottom = chartHeight + axisTop;
  const tickFont = 14;
  const numZTicks = 10;

  const xPlot = x => chartLeftMargin + ((x - xMin) / (xMax - xMin)) * chartWidth;
  const yPlot = z => chartBottom - ((z - zMin) / (zMax - zMin)) * chartHeight;

  return (
    <>
      {/* Axes */}
      <line x1={chartLeftMargin} y1={axisTop} x2={chartLeftMargin} y2={chartBottom} stroke="#888" strokeWidth={2} />
      <line x1={chartLeftMargin} y1={chartBottom} x2={chartLeftMargin + chartWidth} y2={chartBottom} stroke="#888" strokeWidth={2} />

                {/* Z ticks */}
                {[...Array(numZTicks + 1)].map((_, i) => {
                  const zTick = zMin + (i / numZTicks) * (zMax - zMin);
                  const y = yPlot(zTick);
                  return (
                    <g key={i}>
                      <line x1={chartLeftMargin - 5} x2={chartLeftMargin} y1={y} y2={y} stroke="#888" />
                      <text x={chartLeftMargin - 10} y={y + 3} fontSize={tickFont} textAnchor="end" fill="#333">
                        {zTick.toFixed(4)}
                      </text>
                    </g>
                  );
                })}

                {/* X ticks */}
                {[...Array(9)].map((_, i) => {
                  const xTick = xMin + (i / 8) * (xMax - xMin);
                  const x = xPlot(xTick);
                  return (
                    <g key={i}>
                      <line x1={x} x2={x} y1={chartBottom} y2={chartBottom + 5} stroke="#888" />
                      <text x={x} y={chartBottom + 20} fontSize={tickFont} textAnchor="middle" fill="#333">
                        {xTick.toFixed(3)}
                      </text>
                    </g>
                  );
                })}

                {/* Data */}
                {profile.z.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={profile.z
                      .map((z, i) => {
                        const x = profile.x[i];
                        if (x >= xMin && x <= xMax && z >= zMin && z <= zMax) {
                          return `${xPlot(x)},${yPlot(z)}`;
                        }
                        return null;
                      })
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}

                {/* Labels */}
                <text x={chartLeftMargin + chartWidth / 2} y={chartBottom + 50} fontSize="16" fontWeight="bold" fill="#222" textAnchor="middle">
                  X (mm)
                </text>
                <text x={chartLeftMargin - 420} y={axisTop - 30} transform="rotate(-90)" fontSize="16" fontWeight="bold" fill="#222" textAnchor="middle">
                  Z (mm)
                </text>
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
