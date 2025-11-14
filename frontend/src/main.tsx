import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import DataDashboard from "./pages/DataDashboard";
import Responses from "./pages/parts/Responses";
import Participants from "./pages/parts/Participants";
import DescriptiveCodes from "./pages/parts/DescriptiveCodes";
import Questions from "./pages/parts/Questions";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/questions" replace />} />
        <Route path="/dashboard" element={<DataDashboard />}>
          <Route path="" element={<Navigate to="/dashboard/responses" replace />} />
          <Route path="responses" index element={<Responses />} />
          <Route path="participants" element={<Participants />} />
          <Route path="descriptive-codes" element={<DescriptiveCodes />} />
          <Route path="questions" element={<Questions />} />
        </Route>
      </Routes>
    </StrictMode>
  </BrowserRouter>
);