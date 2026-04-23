import axios from "axios"
import {loginAPI } from "../constants/api";


export const loginApi = async (data: { email: string; password: string }) : Promise<any> => {
    const response = await axios.post(loginAPI, data, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
