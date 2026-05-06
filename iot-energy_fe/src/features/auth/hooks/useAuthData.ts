import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/LoginService";
import { useAuthLoginStore, useAuthOTPStore, useRefreshTokenStore } from "../../../app/store/useAuthStore";
import { registerApi } from "../../services/RegisterService";
import { otpApi } from "../../services/CheckOTPService";
import { resendOtpApi } from "../../services/ResendOTPService";


//LOGIN
export function useLoginData() {
    const mutation = useMutation({           //useMutation danh cho POST/PUT/PATCH/DELETE
        mutationFn: loginApi,                //useQuery danh chp GET
    });

    return {
        mutation,
        isPending: mutation.isPending,      //trang thai cua useMutation trong tanstack
        error: mutation.error,
        data: mutation.data,
    };
}

//OTP
export function useOTPData() {
    const setUserIdentify = useAuthOTPStore((state) => state.setUserIdentify);
    const setAuthLogin = useAuthLoginStore((state) => state.setAuthLogin);
    const setRefreshToken = useRefreshTokenStore((state) => state.setRefreshToken);

    const mutation = useMutation({
        mutationFn: otpApi,
        onSuccess: (data, variable) => {
            if (data?.status === "success") {
                setUserIdentify({
                    status: data.status,
                    message: data.message,
                    token: data.token,
                    refresh: data.refresh,
                    otp: variable.otp,
                    email: variable.email
                });
                setAuthLogin({
                    token: data.token,
                    username: data.user.username,
                    email: data.user.email,
                });

                setRefreshToken(data.refresh);
            }
        },
    });

    return {
        mutation,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
    };
}

//RESEND_OTP
export function useResendOTPData() {
    const mutation = useMutation({
        mutationFn: resendOtpApi,
    });

    return {
        mutation,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
    };
}


//REGISTER
export function useRegisterData() {
    const mutation = useMutation({
        mutationFn: registerApi,
    });

    return {
        mutation,
        isPending: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
    };
}

