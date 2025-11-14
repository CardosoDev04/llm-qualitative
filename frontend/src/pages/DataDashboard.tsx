// DataDashboard.tsx
import { Outlet } from "react-router";
import Navbar from "./parts/Navbar";

export default function DataDashboard() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50">
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Navbar />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-20">
        <div className="max-w-6xl mx-auto px-4 pb-6 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
