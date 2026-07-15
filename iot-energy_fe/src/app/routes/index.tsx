import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import OTPPage from "../../features/auth/pages/OTPPage";
import DashboardPage from "../../features/main/pages/DashboardPage";
import DevicePage from "../../features/main/pages/DevicePage";
import ThresholdPage from "../../features/main/pages/ThresholdPage";
import StatisticsPage from "../../features/main/pages/StatisticsPage";
import AlertsPage from "../../features/main/pages/AlertsPage";
import UtilitiesPage from "../../features/main/pages/UtilitiesPage";
import PublicRoute from "../../guard/PublicRoute";
import ProtectedRoute from "../../guard/ProtectedRoute";
import OtpGuard from "../../guard/OtpGuard";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";
import LandingPage from "../../features/public/pages/LandingPage";
import ElectricityPricePage from "../../features/admin/pages/EPricePage";
import ForgotPassPage from "../../features/auth/pages/ForgotPassPage";
import ResetPassPage from "../../features/auth/pages/ResetPassPage";
import DeviceDetailPage from "../../features/main/pages/DeviceDetailPage";
import AdminUsersPage from "../../features/admin/pages/AdminUsersPage";
import AdminUserDetailPage from "../../features/admin/pages/AdminUserDetailPage";
import AdminIotDevicesPage from "../../features/admin/pages/AdminIotDevicesPage";
import AdminMonitoringPage from "../../features/admin/pages/AdminMonitoringPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requireUser>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/devices",
    element: (
      <ProtectedRoute requireUser>
        <DevicePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/devices/:id",
    element: (
      <ProtectedRoute requireUser>
        <DeviceDetailPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/thresholds",
    element: (
      <ProtectedRoute requireUser>
        <ThresholdPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/statistics",
    element: (
      <ProtectedRoute requireUser>
        <StatisticsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/alerts",
    element: (
      <ProtectedRoute requireUser>
        <AlertsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/utilities",
    element: (
      <ProtectedRoute requireUser>
        <UtilitiesPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/:id",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminUserDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/iot-devices",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminIotDevicesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/monitoring",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminMonitoringPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/electricity-prices",
    element: (
      <ProtectedRoute requireAdmin>
        <ElectricityPricePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },

  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },

  {
    path: "/otp",
    element: (
      <OtpGuard>
        <OTPPage />
      </OtpGuard>
    ),
  },

  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassPage />
      </PublicRoute>
    ),
  },

  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <ResetPassPage />
      </PublicRoute>
    ),
  },

]);
