import axios from "axios";
import { registerAPI } from "../constants/api";

export const registerApi = async (
    data: {
        username: string; email: string; password: string
    }) => {
    const response = await axios.post(registerAPI, data);
    return response.data;
}


//Luong chay: mutation.mutate({ username, email, password })
//                          x
// React Query gọi: mutationFn({ username, email, password })
//                          x
// registerApi({ username, email, password })
//                          x
// axios.post(link, data)