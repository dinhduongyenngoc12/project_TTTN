import { getData } from "../services/http";

export type DashboardUser = {
    id: number;
    username: string;
    email: string;
};

export type DashboardEnergyTrend = {
    today_energy: number;
    yesterday_energy: number;
    difference: number;
    percentage: number | null;
    trend: "increase" | "decrease" | "stable";
};

export type DashboardRecentAlert = {
    id: number;
    device_id: number;
    device_name: string;
    power_value: number;
    threshold_value: number;
    created_at: string | null;
};

export type DashboardData = {
    user: DashboardUser;
    device_count: number;
    energy_trend: DashboardEnergyTrend;
    recent_alerts: DashboardRecentAlert[];
};

export type DashboardResponse = {
    status: "success";
    data: DashboardData;
};

export type SystemDashboardData = {
    total_users: number;
    total_devices: number;
    active_iot_devices: number;
    today_alerts: number;
};

export type SystemDashboardResponse = {
    status: "success";
    data: SystemDashboardData;
};

const DASHBOARD_ENDPOINT = "/api/dashboard";

//Lấy dữ liệu tổng quan của người dùng
export async function getDashboardApi(): Promise<DashboardResponse> {
    return await getData<DashboardResponse>(DASHBOARD_ENDPOINT);
}

//Lấy bốn số liệu tổng quan dành riêng cho Admin
export async function getSystemDashboardApi(): Promise<SystemDashboardResponse> {
    return await getData<SystemDashboardResponse>(
        DASHBOARD_ENDPOINT + "/system",
    );
}
