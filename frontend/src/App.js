import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScanDataProvider } from "./components/ScanDataContext";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import LiveDataPage from "./pages/LiveDataPage.jsx";
import ThreeDDataPage from "./pages/ThreeDDataPage.jsx";
import CapturedDataPage from "./pages/CapturedDataPage.jsx";
import CompareDataPage from "./pages/CompareDataPage.jsx";
import HelpCenter from "./components/HelpCenter.jsx"; // <-- NEW

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <ScanDataProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-600 text-gray-200">
          <Header />
          <div className="flex flex-1 min-h-0">
            <Sidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              onOpenHelp={() => setHelpOpen(true)} // <-- wire help
            />
            <main className="flex-1 overflow-auto p-6 min-h-0">
              <Routes>
                <Route path="/" element={<LiveDataPage />} />
                <Route path="/3d" element={<ThreeDDataPage />} />
                <Route path="/captured" element={<CapturedDataPage />} />
                <Route path="/compare" element={<CompareDataPage />} />
              </Routes>
            </main>
          </div>
        </div>

        {/* Help modal lives at app root so it always overlays correctly */}
        <HelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} />
      </Router>
    </ScanDataProvider>
  );
}
