import axios from "axios"
import {loginAPI } from "../constants/api";
import { axiosRefresh } from "../../lib/axiosRefresh";


export const loginApi = async (data: { email: string; password: string }) : Promise<any> => {
    const response = await axios.post(loginAPI, data, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

// Logout dùng refresh token trực tiếp, không đi qua interceptor làm mới token.
export async function logoutApi(refreshToken: string): Promise<void> {
    await axiosRefresh.post("/api/auth/logout", {
        refresh: refreshToken,
    });
}
