import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8765",
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
