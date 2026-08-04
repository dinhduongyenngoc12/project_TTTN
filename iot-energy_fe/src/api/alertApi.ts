import { getData } from "../services/http";

export type AlertItem = {
    id: number;
    alert_config_id: number;
    energy_log_id: number;
    power_value: number | string;
    threshold_value: number | string;
    email_sent: boolean | number;
    created_at: string;
    device_id: number;
    device_name: string;
    device_type: string;
};

export type AlertFilters = {
    device_id?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
};

export type AlertPagination = {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
};

export type AlertsResponse = {
    status: string;
    alerts: AlertItem[];
    filters: {
        device_id: number | null;
        from: string | null;
        to: string | null;
    };
    pagination: AlertPagination;
};

//Lấy lịch sử cảnh báo của người dùng đang đăng nhập.
export async function getAlertsApi(
    filters: AlertFilters,
): Promise<AlertsResponse> {
    return await getData<AlertsResponse>("/api/alerts", filters);
}
