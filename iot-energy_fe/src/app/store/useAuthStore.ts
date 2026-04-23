import { create } from "zustand";
import { persist } from "zustand/middleware";
 
//LOGIN
type LoginProps = {
    token: string | null;
    username: any;
    setAuthLogin: (data: { token: string; username: any }) => void;
    clearAuthLogin: () => void;
};

export const useAuthLoginStore = create<LoginProps>((set) => ({
    token: null,
    username: null,

    setAuthLogin: (data) =>
        set({
            token: data.token,
            username: data.username,
        }),

    clearAuthLogin: () =>
        set({
            token: null,
            username: null,
        }),
}));
 
//OTP EMAIL
type OtpProps = {
    email: string;
    setOTPData: (data: { email: string }) => void;
    clearOtpData: () => void;
};

export const useOtpData = create<OtpProps>()(
    persist(
        (set) => ({
            email: "",

            setOTPData: (data) =>
                set({
                    email: data.email,
                }),

            clearOtpData: () =>
                set({
                    email: "",
                }),
        }),
        {
            name: "OTP",     // name BAT BUOC DUY NHAT - KEY
        }
    )
);

//OTP VERIFY RESULT
type OTPState = {
    otp: string | null;
    email: string | null;
    status: string | null;
    message: string | null;
    token: string | null;
    refresh: string | null;

    setUserIdentify: (data: {
        status: string;
        message: string;
        token: string;
        refresh: string;
        otp: string;
        email: string;
    }) => void;

    clearUserIdentify: () => void;
};

export const useAuthOTPStore = create<OTPState>((set) => ({
    otp: null, email: null, status: null, message: null, token: null, refresh: null,

    setUserIdentify: (data) =>
        set({
            otp: data.otp,
            email: data.email,
            status: data.status,
            message: data.message,
            token: data.token,
            refresh: data.refresh,
        }),

    clearUserIdentify: () =>
        set({
            otp: null, email: null, status: null, message: null, token: null, refresh: null
        }),
}));

//REFRESH TOKEN
type RefreshTokenState = {
    refreshToken: string | null;
    setRefreshToken: (refreshToken: string) => void;
    clearRefreshToken: () => void;
};

export const useRefreshTokenStore = create<RefreshTokenState>()(
    persist(
        (set) => ({
            refreshToken: null,

            setRefreshToken: (refreshToken) =>
                set({
                    refreshToken,
                }),

            clearRefreshToken: () =>
                set({
                    refreshToken: null,
                }),
        }),
        {
            name: "REFRESH_TOKEN",     //name KEY
        }
    )
);