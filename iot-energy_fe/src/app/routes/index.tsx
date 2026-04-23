import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import HomePage from "../../features/main/pages/HomePage";
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
        <HomePage />,
      </ProtectedRoute>
  },
  {
    path: "/login",
    element:
      <PublicRoute>
        <LoginPage />,
      </PublicRoute>
  },
  {
    path: "/register",
    element: 
    <RegisterPage />,
  },

  {
    path: "/otp",
    element:
      <OtpGuard>
        <OTPPage />,
      </OtpGuard>
  },

]);

