import { useAuthLoginStore, useOtpData } from "../app/store/useAuthStore";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthLoginStore((state) => state.token);
    const otpEmail = useOtpData((state) => state.email);

    if (token) {
        return <Navigate to="/" replace />;
    }

    if (!token && otpEmail) {
        return <Navigate to="/otp" replace />;
    }

    return <>{children}</>;
}
