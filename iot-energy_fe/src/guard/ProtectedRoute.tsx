import type React from "react";
import { Navigate } from "react-router-dom";
import { useAuthLoginStore, useOtpData } from "../app/store/useAuthStore";
import { getDefaultRouteByRole, isAdminRole } from "../app/utils/auth";

type ProtectedRouteProps = {
    children: React.ReactNode;

    //bat buoc la admin
    requireAdmin?: boolean;

    //bat buoc la user
    requireUser?: boolean;
};

export default function ProtectedRoute({
    children,
    requireAdmin = false,
    requireUser = false,
}: ProtectedRouteProps) {
    const { token, role } = useAuthLoginStore();
    const otpEmail = useOtpData((state) => state.email);

    if (!token && !otpEmail) {
        return <Navigate to="/" replace />;
    }

    if (!token && otpEmail) {
        return <Navigate to="/otp" replace />;
    }

    const isAdmin = isAdminRole(role);

    if (requireAdmin && !isAdmin) {
        return <Navigate to={getDefaultRouteByRole(role)} replace />;
    }

    if (requireUser && isAdmin) {
        return <Navigate to={getDefaultRouteByRole(role)} replace />;
    }

    return <>{children}</>;
}