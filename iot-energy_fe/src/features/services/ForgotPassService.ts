import { axiosClient } from "../../lib/axiosClient";

export const forgotPasswordApi = async (data: { email: string }) => {
  const response = await axiosClient.post("api/auth/forgot-password", data);
  return response.data;
};

export const resetPasswordApi = async (data: {
  token: string;
  password: string;
}) => {
  const response = await axiosClient.post("api/auth/reset-password", data);
  return response.data;
};