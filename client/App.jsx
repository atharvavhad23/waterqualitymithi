import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Cleanup from "./pages/Cleanup";
import CleanupDrives from "./pages/CleanupDrives";
import News from "./pages/News";
import Profile from "./pages/Profile";
import RiverDetails from "./pages/RiverDetails";
import AddRiver from "./pages/AddRiver";
import EditRiver from "./pages/EditRiver";
import EditRiverInfo from "./pages/EditRiverInfo";
import DashboardLayout from "./components/DashboardLayout";
import PlaceholderPage from "./components/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Maps from "./pages/Maps";
import MLPredictor from "./pages/MLPredictor";
import MLRegression from "./pages/MLRegression";
import WQIClassifier from "./pages/WQIClassifier";
import LinearRegression from "./pages/LinearRegression";
import GISMapping from "./pages/GISMapping";
import AIAnalytics from "./pages/AIAnalytics";
import AdvancedFeatures from "./pages/AdvancedFeatures";
import ModelPerformance from "./pages/ModelPerformance";
import PerformanceMonitor from "./components/PerformanceMonitor";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import DataExport from "./pages/DataExport";

import { FileText, Map, Calendar, Newspaper, Users } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Demo Dashboard Route */}
          <Route
            path="/demo"
            element={
              <DashboardLayout demoMode={true}>
                <Dashboard demoMode={true} />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/ml-predictor"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MLPredictor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/ml-regression"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MLRegression />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/wqi-classifier"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <WQIClassifier />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/linear-regression"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LinearRegression />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/gis-mapping"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GISMapping />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/ai-analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AIAnalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/advanced-features"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdvancedFeatures />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/model-performance"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModelPerformance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/rivers/:slug"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RiverDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/cleanup"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Cleanup />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/cleanup-drives"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CleanupDrives />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/news"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <News />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/maps"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Maps />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/add-river"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddRiver />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/edit-river/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditRiver />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/edit-river-info/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditRiverInfo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/export"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DataExport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Legacy home page */}
          <Route path="/home" element={<Index />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {/* Performance Monitor - only show in development and when performance is not critical */}
      {import.meta.env.DEV && <PerformanceMonitor isVisible={true} />}
    </TooltipProvider>
  </QueryClientProvider>
);

// Prevent multiple mounts in development
const container = document.getElementById("root");
if (!container._reactRootContainer) {
  const root = createRoot(container);
  container._reactRootContainer = root;
  root.render(<App />);
}
