import React from "react";
import { useOtpData } from "../app/store/useAuthStore";
import { Navigate } from "react-router-dom";

export default function OtpGuard({ children } : {children : React.ReactNode }) {

    const email = useOtpData((state) => state.email);
    if (!email) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}