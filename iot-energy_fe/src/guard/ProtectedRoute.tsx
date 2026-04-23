import { Navigate } from "react-router-dom";
import { useAuthLoginStore, useOtpData } from "../app/store/useAuthStore";


export default function ProtectedRoute({ children }: {children: React.ReactNode}) {
    const token = useAuthLoginStore((state) => state.token);
    const otpEmail = useOtpData((state) => state.email);


    if (!token && !otpEmail) {
        return <Navigate to="/login" replace />;
    }
    
    if (!token && otpEmail) {
        return <Navigate to="/otp" replace />;
    }

    return <>{children}</>;
}