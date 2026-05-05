// services/Auth/CheckOtpService.ts
import axios from "axios";
import { check_otpAPI } from "../../features/constants/api";

export type CheckOTPData = {
    email: string;
    otp: string;
};

export type CheckOTPResponse = {
    status: string;
    message: string;
    token: string;
    refresh: string;
};

export const checkOTPApi = async (
    data: CheckOTPData ): Promise<CheckOTPResponse> => {
        const response = await axios.post(check_otpAPI, data);
    return response.data;
};