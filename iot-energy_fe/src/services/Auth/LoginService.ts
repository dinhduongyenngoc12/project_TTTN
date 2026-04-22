import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8765",
    headers: {
        "Content-Type": "application/json",
    },
});

export const loginApi = async (payload: { email: string; password: string }) => {
    const response = await axiosClient.post("/auth/login", payload);
    return response.data;
};

export default axiosClient;
