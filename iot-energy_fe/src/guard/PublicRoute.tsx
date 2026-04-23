import { useAuthLoginStore } from "../app/store/useAuthStore";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }: {children: React.ReactNode}) {
    const token = useAuthLoginStore((state) => state.token);
    if (token) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>
}