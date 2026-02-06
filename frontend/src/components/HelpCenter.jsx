import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const PAGES = [
  { id: "live", label: "Live Data" },
  { id: "3d", label: "3D Data" },
  { id: "captured", label: "2D Captured Data" },
  { id: "compare", label: "Compare 2D Data" },
];

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-100 mb-1">{title}</h4>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

const HelpCopy = {
  live: (
    <>
      <Section title="Overview">
        View a live stream/profile from the sensor. Use the buttons to start/stop or snapshot.
      </Section>
      <Section title="Controls">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Load / Connect</b>: Start the live stream.</li>
          <li><b>Measure On/Off</b>: Toggle vertical (red) and horizontal (orange) rulers.</li>
          <li><b>Point Measure</b>: Click two points to see path distance, straight distance, and angle.</li>
          <li><b>Scroll to Zoom</b>: Zooms the graph under your cursor (page won’t scroll).</li>
          <li><b>Drag to Pan</b>: When not measuring, drag the graph to move along X.</li>
        </ul>
      </Section>
      <Section title="Reading Values">
        The table below the graph shows all values in <b>mm</b>, including ΔX, ΔZ, path length, and min/max Z.
      </Section>
    </>
  ),
  "3d": (
    <>
      <Section title="Overview">
        Displays a 3D reconstruction of the surface. A single 2D slice (X or Y) feeds the right‑side chart.
      </Section>
      <Section title="Top Buttons">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Load/Reload CSV</b>: Import surface data.</li>
          <li><b>X Slice / Y Slice</b>: Choose which slice is active (only one at a time).</li>
          <li><b>Show/Hide Slice</b>: Toggle the slice plane and the right‑side chart.</li>
          <li><b>Reset View</b>: Re‑center the 3D camera.</li>
          <li><b>Clear All Data</b>: Clears surface and saved settings.</li>
        </ul>
      </Section>
      <Section title="3D Controls">
        Orbit with mouse (drag), zoom wheel, and pan (right‑click drag) via OrbitControls. Reference axes are shortened for visibility.
      </Section>
      <Section title="Slice Slider">
        When a slice is shown, the slider sets its index. The slice plane starts at zero and spans positive extents.
      </Section>
      <Section title="Right‑Side Chart (ProfileViewer)">
        Same measuring tools as 2D: <b>Measure</b> rulers, <b>Point Measure</b>, and mm‑based table readout.
      </Section>
    </>
  ),
  captured: (
    <>
      <Section title="Overview">
        Review saved 2D profiles and measure them like the live chart.
      </Section>
      <Section title="Controls">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Load Data</b>: Import CSV of profiles.</li>
          <li><b>Measure On/Off</b>: Red vertical & orange horizontal lines. Drag to move them.</li>
          <li><b>Point Measure</b>: Click two points along the curve; path and chord shown.</li>
          <li><b>Wheel Zoom</b> + <b>Drag Pan</b>: Navigate along X without scrolling the page.</li>
          <li><b>Scan Slider</b>: Switch between loaded scans.</li>
        </ul>
      </Section>
      <Section title="Table">
        Metrics are in <b>mm</b>: ΔX, ΔZ, Path Distance, Z Min/Max, plus point‑to‑point numbers when active.
      </Section>
    </>
  ),
  compare: (
    <>
      <Section title="Overview">
        Compare two 2D profiles side‑by‑side. Each viewer has its own Measure and Point Measure toggles.
      </Section>
      <Section title="Controls">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Lock Compare</b>: Sync pan/zoom, measurement handles, and point‑measure between both charts.</li>
          <li><b>Load Data (each)</b>: Load left and right independently.</li>
          <li><b>Sliders</b>: Choose which scan to display on each side.</li>
        </ul>
      </Section>
      <Section title="Measuring">
        Same as other charts: rulers/handles in mm, and a table showing ΔX, ΔZ, path length, and Z min/max.
      </Section>
    </>
  ),
};

export default function HelpCenter({ open, onClose, initialPage = "live" }) {
  const [page, setPage] = useState(initialPage);
  const dialogRef = useRef(null);

  // Reset to initial tab whenever reopened
  useEffect(() => {
    if (open) setPage(initialPage);
  }, [open, initialPage]);

  // Close on ESC, basic focus management
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-12 -translate-x-1/2 w-[min(900px,92vw)] bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
          <h3 className="text-white font-semibold">Help &nbsp;•&nbsp; Page Guide</h3>
          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-300"
            onClick={onClose}
            aria-label="Close help"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3 bg-gray-900/60 border-b border-gray-700">
          {PAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition
                ${page === p.id ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 max-h-[65vh] overflow-auto">
          {HelpCopy[page] || <div className="text-sm text-gray-300">No help available.</div>}
        </div>

        {/* Footer (quick links to page routes if you want) */}
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-700 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-700 text-gray-100 hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
