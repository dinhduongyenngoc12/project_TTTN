import { getData } from "../services/http";

export type AdminUserItem = {
    id: number;
    username: string;
    email: string;
    role: string;
    device_count: number | string;
};

export type AdminUserDevice = {
    id: number;
    user_id: number;
    name: string;
    device_type: string;
    rated_power: string | null;
    status: "active" | "inactive";
    activated_at: string | null;
};

export type AdminUserDetail = {
    id: number;
    username: string;
    email: string;
    role: string;
    devices: AdminUserDevice[];
};

type AdminUsersResponse = {
    status: "success";
    totalUsers: number;
    users: AdminUserItem[];
};

type AdminUserDetailResponse = {
    status: "success";
    user: AdminUserDetail;
};

//Lấy danh sách tài khoản người dùng dành cho trang quản trị
export async function getAdminUsersApi(): Promise<AdminUsersResponse> {
    return await getData<AdminUsersResponse>("/api/users");
}

//Lấy thông tin tài khoản và các thiết bị thuộc đúng người dùng được chọn
export async function getAdminUserDetailApi(id: number): Promise<AdminUserDetailResponse> {
    return await getData<AdminUserDetailResponse>(
        "/api/users/" + id
    );
}
