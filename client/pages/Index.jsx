// client/index.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../components/DashboardLayout";
import PlaceholderPage from "../components/PlaceholderPage";
import NotFound from "../pages/NotFound";

import { FileText, Map, Calendar, Newspaper, Users } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <DashboardLayout>
                <PlaceholderPage
                  title="Pollution Reports"
                  description="Citizens can report garbage and pollution here."
                  icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/maps"
            element={
              <DashboardLayout>
                <PlaceholderPage
                  title="Interactive Maps"
                  description="View pollution levels across rivers on a map."
                  icon={<Map className="w-8 h-8 text-muted-foreground" />}
                />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/cleanup"
            element={
              <DashboardLayout>
                <PlaceholderPage
                  title="Cleanup Drives"
                  description="Register as a volunteer for cleanup events."
                  icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/news"
            element={
              <DashboardLayout>
                <PlaceholderPage
                  title="Blog & News"
                  description="Read news about water conservation."
                  icon={<Newspaper className="w-8 h-8 text-muted-foreground" />}
                />
              </DashboardLayout>
            }
          />

          {/* Redirect /home → Dashboard */}
          <Route path="/home" element={<Dashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");

  useEffect(() => {
    fetchDemo();
  }, []);

  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = await response.json();
      setExampleFromServer(data.message);
    } catch (error) {
      console.error("Error fetching demo:", error);
    }
  };

  // --- Classifier Demo Widget ---
  const [classifierInput, setClassifierInput] = useState(0);
  const [classifierResult, setClassifierResult] = useState(null);
  const runClassifier = async () => {
    try {
      const response = await fetch("/api/classifier-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wqi: classifierInput })
      });
      const data = await response.json();
      setClassifierResult(data.result);
    } catch (err) {
      setClassifierResult("Error");
    }
  };

  // --- Linear Regression Demo Widget ---
  const [regressionInput, setRegressionInput] = useState(0);
  const [regressionResult, setRegressionResult] = useState(null);
  const runRegression = async () => {
    try {
      const response = await fetch("/api/linear-regression-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: regressionInput })
      });
      const data = await response.json();
      setRegressionResult(data.prediction);
    } catch (err) {
      setRegressionResult("Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Welcome to River Monitor</h1>
      <p className="text-gray-600 mt-2">Track and protect our rivers.</p>
      {exampleFromServer && (
        <p className="mt-2 text-green-600">Server says: {exampleFromServer}</p>
      )}

      {/* ML prediction and classifier widgets are now on their own page. Access them from the dashboard ML Prediction option. */}
    </div>
  );
}
