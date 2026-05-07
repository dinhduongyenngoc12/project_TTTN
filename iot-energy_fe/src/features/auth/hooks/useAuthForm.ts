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

                        navigate("/", {
                            replace: true,
                        });
                    } else {
                        setMsg(data?.message || "OTP không hợp lệ hoặc hết hạn");
                    }
                },
                onError: (error) => {
                    setMsg(getApiErrorMessage(error, "OTP không hợp lệ hoặc hết hạn"));
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

    const handleRegister = ({ username, email, password }: {
        username: string;
        email: string;
        password: string;
    }) => {
        if (mutation.isPending) return;

        setMsg("");

        mutation.mutate(
            {
                username,
                email,
                password,
            },
            {
                onSuccess: (data) => {
                    console.log("Register success:", data);

                    navigate("/login", {
                        replace: true,
                    });
                },
                onError: (error) => {
                    console.log("Register error:", error);

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
    };
}

export function useLogoutForm() {
    const navigate = useNavigate();
    const clearAuthLogin = useAuthLoginStore((state) => state.clearAuthLogin);
    const clearOtpData = useOtpData((state) => state.clearOtpData);
    const clearRefreshToken = useRefreshTokenStore((state) => state.clearRefreshToken);
    const clearUserIdentify = useAuthOTPStore((state) => state.clearUserIdentify);

    const handleLogout = () => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");

        if (!isConfirmed) {
            return;
        }

        clearAuthLogin();
        clearOtpData();
        clearRefreshToken();
        clearUserIdentify();

        navigate("/login", {
            replace: true,
        });
    };

    return {
        handleLogout,
    };
}
