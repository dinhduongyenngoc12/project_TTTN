import { getData } from "../services/http";

export type SystemAlertItem = {
    id: number;
    username: string;
    device_name: string;
    power_value: number;
    threshold_value: number;
    email_sent: boolean;
    created_at: string;
};

type SystemAlertsResponse = {
    status: "success";
    alerts: SystemAlertItem[];
};

//Lấy tối đa 20 cảnh báo mới nhất dành cho Admin
export async function getSystemAlertsApi(): Promise<SystemAlertsResponse> {
    return await getData<SystemAlertsResponse>("/api/alerts/system");
}
