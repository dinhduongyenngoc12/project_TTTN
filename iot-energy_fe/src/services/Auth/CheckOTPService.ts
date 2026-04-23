// services/Auth/CheckOtpService.ts
import axios from "axios";

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
        const response = await axios.post("http://localhost:8765/api/auth/checkOTP", data);
    return response.data;
};