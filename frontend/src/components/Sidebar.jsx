import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ArrowsRightLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { to: "/", label: "Live Data", icon: HomeIcon },
  { to: "/3d", label: "3D Data", icon: CubeIcon },
  { to: "/captured", label: "2D Captured Data", icon: Squares2X2Icon },
  { to: "/compare", label: "Compare 2D Data", icon: ArrowsRightLeftIcon },
];

function Chevron({ direction = "right" }) {
  return direction === "right" ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/**
 * Props:
 * - open: boolean
 * - setOpen: (bool) => void
 * - onOpenHelp?: () => void
 */
export default function Sidebar({ open, setOpen, onOpenHelp }) {
  return (
    <div className="relative h-screen">
      <aside
        className={`transition-all duration-150 bg-gray-800 border-r border-gray-700
          ${open ? "w-64 p-4" : "w-14 p-2 flex flex-col items-center"}`}
        style={{ zIndex: 50, position: "relative" }}
      >
        {/* Navigation Tabs */}
        <nav className={`flex flex-col gap-2 mt-8 ${open ? "" : "items-center"}`}>
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              end
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `py-2 px-4 rounded transition cursor-pointer font-medium whitespace-nowrap flex items-center gap-2
                ${isActive ? "bg-green-900 text-white" : "text-gray-300 hover:bg-gray-700"}
                ${open ? "w-full text-left" : "w-10 justify-center"}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {open && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {/* Divider */}
          <div className={`border-t border-gray-700 ${open ? "mx-1 my-3" : "w-8 my-3"}`} />

          {/* Help button */}
          <button
            type="button"
            onClick={onOpenHelp}
            title="Help"
            className={`${open ? "w-full justify-start px-4" : "w-10 justify-center px-0"}
                        py-2 rounded transition cursor-pointer font-medium whitespace-nowrap flex items-center gap-2
                        text-gray-300 hover:bg-gray-700`}
          >
            <QuestionMarkCircleIcon className="w-5 h-5 flex-shrink-0" />
            {open && <span>Help</span>}
          </button>
        </nav>

        {/* Collapse/Expand Button */}
        <button
          className="absolute top-4 right-0 z-20 bg-gray-900 border border-gray-700 shadow rounded-full p-1 transition hover:bg-gray-700"
          style={{ width: 28, height: 28, transform: "translateX(50%)" }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Chevron direction={open ? "right" : "left"} />
        </button>
      </aside>
    </div>
  );
}
