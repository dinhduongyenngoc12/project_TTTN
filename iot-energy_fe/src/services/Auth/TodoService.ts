import axiosClient from "./LoginService";

// GET DATA
export const getData = async () => {
    const response = await axiosClient.get("/api/todos");
    return response.data;
};

// POST DATA
export const postData = async (newTodo: any) => {
    const response = await axiosClient.post("/api/todos", newTodo);
    return response.data;
};