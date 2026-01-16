import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";

// Páginas
import Home from "./pages/Home";
import LibraryPage from "./pages/Library";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

// Tu login actual
import Login from "./pages/Login"; // ajusta ruta si corresponde

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/home" replace />} />

        <Route path="/login" element={<Login onSuccess={() => (window.location.href = "/app/home")} />} />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="home" element={<Home />} />
                  <Route path="library" element={<LibraryPage />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/app/home" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
