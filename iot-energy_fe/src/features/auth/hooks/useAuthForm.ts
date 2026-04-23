import { useState } from "react";
import { useOtpData } from "../../../app/store/useAuthStore";
import { useLoginData, useOTPData, useRegisterData } from "./useAuthData";
import { useNavigate } from "react-router-dom";

export function useLoginForm() {
    const { mutation } = useLoginData();
    const navigate = useNavigate();
    const otpData = useOtpData();
    const handleLogin = (
        { email, password }: { email: string; password: string },
        options?: { onSuccess?: (data: any) => void }
    ) => {

        if (mutation.isPending) return;

        mutation.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);

                    if (data?.status === "success" && data?.email) {
                        console.log(data)
                        otpData.setOTPData({ email: data?.email })
                        navigate("/otp", {
                            state: { email },
                        });
                    } else {
                        console.log("Login fail:", data?.message);
                        navigate("/login");
                    }
                },
            }
        );
    };

    return {
        handleLogin,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
    };
}

export function useOTPForm() {
    const { mutation } = useOTPData();
    const otpData = useOtpData()
    const [msg, setMsg] = useState('')


    const handleOTP = ({ otp }: { otp: string },
        options?: { onSuccess?: (data: any) => void }
    ) => {

        mutation.mutate({ otp, email: otpData.email },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);

                    if (data?.status === "success") {

                    }else{
                        setMsg(data.message)
                    }
                }
            }
        );
    };

    return {
        handleOTP,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
        isSuccess: mutation.isSuccess,
        msg
    };
}


export function useRegisterForm() {
    const { mutation } = useRegisterData();
    const regisData = useRegisterData();

    const handleRegister = ({
        username,
        email,
        password }: {
            username: string;
            email: string;
            password: string;
        },options?: { onSuccess?: (data: any) => void }) => {
        mutation.mutate({ username, email, password },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);

                    // if (data?.status === "success" && data?.email) {
                    //     console.log(data)
                    //     otpData.setOTPData({ email: data?.email })
                    //     navigate("/otp", {
                    //         state: { email },
                    //     });
                    // } else {
                    //     navigate("/login");
                    // }
                },
            }
        );
    };

    return {
        handleRegister,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
        isSuccess: mutation.isSuccess,
    };
}
