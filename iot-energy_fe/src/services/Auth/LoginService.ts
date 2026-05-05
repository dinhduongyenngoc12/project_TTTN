import axios from "axios";
import { BASE_URL } from "../../features/constants/api";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const loginApi = async (
    data: { email: string; password: string
    
}) => {
    const response = await axiosClient.post("api/auth/login", data);
    return response.data;
};

export default axiosClient;
