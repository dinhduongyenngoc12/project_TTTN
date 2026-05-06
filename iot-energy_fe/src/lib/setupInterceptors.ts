import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { axiosClient } from "./axiosClient";
import { axiosRefresh } from "./axiosRefresh";
import { useAuthLoginStore, useAuthOTPStore, useOtpData, useRefreshTokenStore } from "../app/store/useAuthStore";

type FailedQueueItem = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
}

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

function clearAllAuth() {
    useAuthLoginStore.getState().clearAuthLogin();
    useRefreshTokenStore.getState().clearRefreshToken();
    useAuthOTPStore.getState().clearUserIdentify();
    useOtpData.getState().clearOtpData();
}

export function setupInterceptors() {
    //REQUEST
    axiosClient.interceptors.request.use(
        (config) => {
            const token = useAuthLoginStore.getState().token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    //RESPONSE
    axiosClient.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as CustomAxiosRequestConfig;
            const status = error.response?.status;

            if (!status || status !== 401) {
                return Promise.reject(error);
            }

            // tránh loop vô hạn
            if (originalRequest._retry) {
                clearAllAuth();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            const refreshToken = useRefreshTokenStore.getState().refreshToken;

            if (!refreshToken) {
                clearAllAuth();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            //không refresh cho chính API refresh
            if (originalRequest.url?.includes("/auth/refresh")) {
                clearAllAuth();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            //nếu đang refresh rồi thì xếp hàng chờ
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            resolve(axiosClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axiosRefresh.post("/auth/refresh", {
                    refresh: refreshToken,
                });

                //backend của bạn có thể trả token / refresh
                const newToken = response.data?.token;
                const newRefreshToken = response.data?.refresh ?? refreshToken;

                if (!newToken) {
                    throw new Error("Không lấy được token mới");
                }

                //cập nhật access token mới
                const currentUsername = useAuthLoginStore.getState().username;
                const currentEmail = useAuthLoginStore.getState().email;

                useAuthLoginStore.getState().setAuthLogin({                    //refresh chi doi access token
                    token: newToken,
                    username: currentUsername ?? "",
                    email: currentEmail ?? "",
                });


                //cập nhật refresh token mới nếu có
                useRefreshTokenStore.getState().setRefreshToken(newRefreshToken);

                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAllAuth();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
    );
}