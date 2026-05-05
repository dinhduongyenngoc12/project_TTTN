import axios from "axios";
import { check_otpAPI } from "../constants/api";

export type CheckOTPData = {
    email: string;
    otp: string;
};

export type CheckOTPResponse = {
    status: string;
    message: string;
    token: string;
    refresh: string;
    user: {
        username: string;
        email: string;
    };
};


export const otpApi = async (
    data: CheckOTPData ): Promise<CheckOTPResponse> => {
        const response = await axios.post(check_otpAPI, data);
    return response.data;
};

