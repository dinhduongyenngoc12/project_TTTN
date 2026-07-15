// src/lib/axiosClient.ts
import axios from "axios";
import { BASE_URL } from "../features/constants/api";

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

axiosClient.interceptors.request.use((config) => {
    const authStorage = localStorage.getItem("AUTH_LOGIN");

    if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;

        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }
    }

    return config;
});