import { isAxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useAuthLoginStore,
    useAuthOTPStore,
    useOtpData,
    useRefreshTokenStore,
} from "../../../app/store/useAuthStore";
import {
    useLoginData,
    useOTPData,
    useRegisterData,
    useResendOTPData,
} from "./useAuthData";
import { getDefaultRouteByRole } from "../../../app/utils/auth";
import { queryClient } from "../../../services/queryClient";
import { logoutApi } from "../../services/LoginService";

type ApiErrorResponse = {
    message?: string;
    status?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
}

export function useLoginForm() {
    const { mutation } = useLoginData();
    const navigate = useNavigate();
    const otpData = useOtpData();
    const [msg, setMsg] = useState("");


    //const handleLogin = (data: { email: string; password: string }) => {
    //  const email = data.email;
    //  const password = data.password;
    //};  destructuring object + khai bao kieu dl
    const handleLogin = (
        { email, password }: { email: string; password: string },
        options?: { onSuccess?: (data: any) => void },
    ) => {
        if (mutation.isPending) return;

        setMsg("");

        mutation.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);

                    if (data?.status === "success" && data?.email) {
                        setMsg("ĐĂNG NHẬP THÀNH CÔNG, VUI LÒNG KIỂM TRA OTP");

                        otpData.setOTPData({ email: data.email });

                        navigate("/otp", {
                            replace: true,
                            state: { email },
                        });
                    } else {
                        setMsg(data?.message || "ĐĂNG NHẬP THẤT BẠI");
                    }
                },
                onError: (error) => {
                    setMsg(getApiErrorMessage(error, "ĐĂNG NHẬP THẤT BẠI"));
                },
            },
        );
    };

    return {
        handleLogin,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        msg,
    };
}

export function useOTPForm() {
    const { mutation } = useOTPData();
    const otpData = useOtpData();
    const clearOtpData = useOtpData((state) => state.clearOtpData);
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");

    const handleOTP = (
        { otp }: { otp: string },
        options?: { onSuccess?: (data: any) => void },
    ) => {
        if (mutation.isPending) return;

        setMsg("");

        mutation.mutate(
            {
                otp,
                email: otpData.email,
            },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);

                    if (data?.status === "success") {
                        setMsg("XÁC THỰC OTP THÀNH CÔNG");

                        clearOtpData();

                        navigate(getDefaultRouteByRole(data?.user?.role), {
                            replace: true,
                        });
                    } else {
                        setMsg(data?.message || "OTP không hợp lệ hoặc đã hết hạn");
                    }
                },
                onError: (error) => {
                    setMsg(getApiErrorMessage(error, "OTP không hợp lệ hoặc đã hết hạn"));
                },
            },
        );
    };

    return {
        handleOTP,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
        isSuccess: mutation.isSuccess,
        msg,
    };
}

export function useResendOTPForm() {
    const { mutation } = useResendOTPData();
    const otpData = useOtpData();
    const [msg, setMsg] = useState("");

    const handleResendOTP = () => {
        if (!otpData.email || mutation.isPending) return;

        setMsg("");

        mutation.mutate(
            { email: otpData.email },
            {
                onSuccess: (data) => {
                    if (data?.status === "success") {
                        setMsg("Đã gửi lại mã OTP, vui lòng kiểm tra lại email.");
                    } else {
                        setMsg(data?.message || "Gửi lại mã OTP thất bại");
                    }
                },
                onError: (error) => {
                    setMsg(getApiErrorMessage(error, "Gửi lại mã OTP thất bại"));
                },
            },
        );
    };

    return {
        handleResendOTP,
        isPending: mutation.isPending,
        msg,
    };
}

export function useRegisterForm() {
    const { mutation, isPending } = useRegisterData();
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

    const handleRegister = ({ username, email, password }: {
        username: string;
        email: string;
        password: string;
    }) => {
        if (mutation.isPending) return;

        setMsg("");
        setIsRegisterSuccess(false);

        mutation.mutate(
            {
                username,
                email,
                password,
            },
            {
                onSuccess: (data) => {
                    console.log("Register success:", data);

                    // Thông báo kết quả trước khi chuyển người dùng sang trang đăng nhập.
                    setIsRegisterSuccess(true);
                    setMsg("Đăng ký tài khoản thành công");

                    setTimeout(() => {
                        navigate("/login", {
                            replace: true,
                        });
                    }, 1200);
                },
                onError: (error) => {
                    console.log("Register error:", error);

                    setIsRegisterSuccess(false);
                    setMsg(
                        getApiErrorMessage(
                            error,
                            "ĐĂNG KÝ THẤT BẠI, tên đăng nhập hoặc email đã tồn tại!",
                        ),
                    );
                },
            },
        );
    };

    return {
        handleRegister,
        isPending,
        msg,
        isRegisterSuccess,
    };
}

export function useLogoutForm() {
    const navigate = useNavigate();
    const clearAuthLogin = useAuthLoginStore((state) => state.clearAuthLogin);
    const clearOtpData = useOtpData((state) => state.clearOtpData);
    const clearRefreshToken = useRefreshTokenStore((state) => state.clearRefreshToken);
    const refreshToken = useRefreshTokenStore((state) => state.refreshToken);
    const clearUserIdentify = useAuthOTPStore((state) => state.clearUserIdentify);

    const handleLogout = async () => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");

        if (!isConfirmed) {
            return;
        }

        try {
            if (refreshToken) {
                // Thu hồi refresh token trên backend trước khi xóa bản local.
                await logoutApi(refreshToken);
            }
        } finally {
            /*
             * Dù backend tạm thời không phản hồi, thiết bị hiện tại vẫn phải
             * xóa phiên cục bộ để người dùng hoàn tất thao tác đăng xuất.
             */
            queryClient.clear();
            clearAuthLogin();
            clearOtpData();
            clearRefreshToken();
            clearUserIdentify();

            navigate("/", {
                replace: true,
            });
        }
    };

    return {
        handleLogout,
    };
}
