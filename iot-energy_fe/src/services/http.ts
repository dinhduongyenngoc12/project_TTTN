import { axiosClient } from "../lib/axiosClient";

//GET
export async function getData<T>(url: string, params?: Record<string, unknown>) {
    const response = await axiosClient.get<T>(url, { params });     //<T> Type Varible
    return response;
}

//POST Generic <T, B = unknown>
export async function postData<T, B = unknown>(url: string, body?: B): Promise<T> {
    const response = await axiosClient.post<T>(url, body);
    return response.data;
}

//PUT thay the toan bo
export async function putData<T, B = unknown>(url: string, body?: B): Promise<T> {
    const response = await axiosClient.post<T>(url, body);
    return response.data;
}

//PATCH cap nhat 1phan
export async function patchData<T, B = unknown>(url: string, body?: B): Promise<T> {
    const response = await axiosClient.post<T>(url, body);
    return response.data;
}

//DELETE
export async function deleteData<T>(url: string): Promise<T> {
    const response = await axiosClient.post<T>(url);
    return response.data;
}
