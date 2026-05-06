import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import HomePage from "../../features/main/pages/HomePage";
import DevicePage from "../../features/main/pages/DevicePage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import OTPPage from "../../features/auth/pages/OTPPage";
import PublicRoute from "../../guard/PublicRoute";
import ProtectedRoute from "../../guard/ProtectedRoute";
import OtpGuard from "../../guard/OtpGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element:
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
  },

  {
    path: "/devices",
    element:
      <ProtectedRoute>
        <DevicePage />
      </ProtectedRoute>
  },


  {
    path: "/login",
    element:
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
  },

  {
    path: "/register",
    element:
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
  },

  {
    path: "/otp",
    element:
      <OtpGuard>
        <OTPPage />
      </OtpGuard>
  },

]);

