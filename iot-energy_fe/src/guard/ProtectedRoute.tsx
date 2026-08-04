import type React from "react";
import { Navigate } from "react-router-dom";
import {
    useAuthLoginStore,
    useOtpData,
    useRefreshTokenStore,
} from "../app/store/useAuthStore";
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
    const refreshToken = useRefreshTokenStore(
        (state) => state.refreshToken,
    );

    /*
     * Chỉ xem là chưa có phiên khi cả access token và refresh token đều không có.
     * Nếu access token hết hạn nhưng refresh token còn hạn, interceptor sẽ tự cấp
     * token mới khi trang gọi API; Guard không được đăng xuất user quá sớm.
     */
    if (!token && !refreshToken && !otpEmail) {
        return <Navigate to="/" replace />;
    }

    // Chỉ chuyển OTP khi người dùng chưa có bất kỳ phiên token nào.
    if (!token && !refreshToken && otpEmail) {
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
