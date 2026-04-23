// src/lib/axiosRefresh.ts
import axios from "axios";
import { BASE_URL } from "../features/constants/api";

export const axiosRefresh = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});