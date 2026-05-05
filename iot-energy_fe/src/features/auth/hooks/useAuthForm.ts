import { useState } from "react";
import {
    useAuthLoginStore,
    useAuthOTPStore,
    useOtpData,
    useRefreshTokenStore
} from "../../../app/store/useAuthStore";

import { useLoginData, useOTPData, useRegisterData } from "./useAuthData";
import { useNavigate } from "react-router-dom";

export function useLoginForm() {
    const { mutation } = useLoginData();
    const navigate = useNavigate();
    const otpData = useOtpData();

    const [msg, setMsg] = useState("");

    const handleLogin = (
        { email, password }: { email: string; password: string },
        options?: { onSuccess?: (data: any) => void }
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

                onError: () => {
                    setMsg("ĐĂNG NHẬP THẤT BẠI");
                },
            }
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
        options?: { onSuccess?: (data: any) => void }
    ) => {
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
                        setMsg(data?.message || "OTP không hợp lệ");
                    }
                },

                onError: () => {
                    setMsg("OTP không hợp lệ hoặc đã hết hạn");
                },
            }
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


export function useRegisterForm() {
    const { mutation, isPending } = useRegisterData();
    const navigate = useNavigate();

    const handleRegister = ({ username, email, password }: {
        username: string;
        email: string;
        password: string;
    }) => {
        mutation.mutate(
            {
                username,
                email,
                password,
            },
            {
                onSuccess: (data) => {
                    console.log("Register success:", data);

                    alert("ĐĂNG KÍ THÀNH CÔNG");

                    navigate("/login", {
                        replace: true,
                    });
                },
                onError: (error) => {
                    console.log("Register error:", error);

                    alert("ĐĂNG KÍ THẤT BẠI");
                },
            }
        );
    };

    return {
        handleRegister,
        isPending,
    };
}


export function useLogoutForm() {
    const navigate = useNavigate();

    const clearAuthLogin = useAuthLoginStore((state) => state.clearAuthLogin);
    const clearOtpData = useOtpData((state) => state.clearOtpData);
    const clearRefreshToken = useRefreshTokenStore((state) => state.clearRefreshToken);
    const clearUserIdentify = useAuthOTPStore((state) => state.clearUserIdentify);

    const handleLogout = () => {
        const isConfirmed = window.confirm("BẠN CÓ CHẮC CHẮN MUỐN ĐĂNG XUẤT KHÔNG ?");

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

