import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { axiosClient } from "./axiosClient";
import { axiosRefresh } from "./axiosRefresh";
import { useAuthLoginStore, useAuthOTPStore, useOtpData, useRefreshTokenStore } from "../app/store/useAuthStore";
import { queryClient } from "../services/queryClient";
import { saveAuthNotice } from "../app/utils/authSession";

type FailedQueueItem = {
    resolve: (token: string) => void;      
    reject: (error: unknown) => void;
};

//dung let thay vi const vi bien con can gan lai (thay doi tham chieu)
let isRefreshing = false;                                  
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {              //chong refresh token storm
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
    // Cache API chỉ có giá trị trong phiên hiện tại, vì vậy phải xóa khi phiên kết thúc
    queryClient.clear();

    useAuthLoginStore.getState().clearAuthLogin();
    useRefreshTokenStore.getState().clearRefreshToken();
    useAuthOTPStore.getState().clearUserIdentify();
    useOtpData.getState().clearOtpData();
}

//Kết thúc phiên khi refresh token không còn khả dụng và báo lý do cho người dùng
function handleSessionExpired() {
    saveAuthNotice("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    clearAllAuth();

    //replace ngăn người dùng quay lại trang yêu cầu đăng nhập bằng nút Back
    window.location.replace("/login");
}

export function setupInterceptors() {
    //REQUEST
    axiosClient.interceptors.request.use(
        (config) => {
            const token = useAuthLoginStore.getState().token;

            if (token) {
                config.headers.Authorization = "Bearer " + token;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    //RESPONSE
    axiosClient.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const status = error.response?.status;
            const originalRequest = error.config as
                | CustomAxiosRequestConfig
                | undefined;

            // Chỉ lỗi 401 mới liên quan đến access token cần được làm mới.
            if (status !== 401 || !originalRequest) {
                return Promise.reject(error);
            }

            //tranh loop vo han
            if (originalRequest._retry) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            const refreshToken = useRefreshTokenStore.getState().refreshToken;

            if (!refreshToken) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            //khong refresh cho chinh API refresh
            if (originalRequest.url?.includes("/api/auth/refresh")) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            //neu dang refresh roi thi xep hang cho
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = "Bearer " + newToken;
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
                // Backend khai báo route đầy đủ là POST /api/auth/refresh.
                const response = await axiosRefresh.post("/api/auth/refresh", {
                    refresh: refreshToken,
                });

                //backend của bạn có thể trả token / refresh
                const newToken = response.data?.token;
                const newRefreshToken = response.data?.refresh;

                if (!newToken || !newRefreshToken) {
                    throw new Error("API refresh không trả đủ token mới");
                }

                //update access token moi
                const currentUsername = useAuthLoginStore.getState().username;
                const currentEmail = useAuthLoginStore.getState().email;
                const currentRole = useAuthLoginStore.getState().role;

                useAuthLoginStore.getState().setAuthLogin({                    //refresh chi doi access token
                    token: newToken,
                    username: currentUsername ?? "",
                    email: currentEmail ?? "",
                    role: currentRole,
                });


                //update refresh token neuco
                useRefreshTokenStore.getState().setRefreshToken(newRefreshToken);

                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = "Bearer " + newToken;
                }

                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                handleSessionExpired();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
    );
}
