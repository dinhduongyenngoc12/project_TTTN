import axios from "axios";
import { resend_otpAPI } from "../constants/api";

export type ResendOTPData = {
    email: string;
};

export type ResendOTPResponse = {
    status: string;
    message: string;
    email?: string;
};

export const resendOtpApi = async (
    data: ResendOTPData
): Promise<ResendOTPResponse> => {
    const response = await axios.post(resend_otpAPI, data);
    return response.data;
};
