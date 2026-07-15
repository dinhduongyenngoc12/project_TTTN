import { getData, patchData } from "../services/http";

export type AlertMode = "auto" | "manual";
export type LearningStatus = "learning" | "learned_3d" | "learned_7d";

export type AlertConfigItem = {
    id: number;
    device_id: number;
    default_threshold: string | number | null;
    power_threshold: string | number | null;
    mode: AlertMode;
    learning_status: LearningStatus;
    learned_at?: string | null;
    last_email_sent_at?: string | null;
    device?: {
        id: number;
        name: string;
        device_type: string;
        rated_power?: string | number | null;
        status?: string;
    };
};

export type AlertConfigsResponse = {
    status: string;
    alertConfigs: AlertConfigItem[];
};

export type UpdateAlertConfigPayload = {
    mode: AlertMode;
    power_threshold?: number | null;
};

export async function getAlertConfigsApi(): Promise<AlertConfigItem[]> {
    const response = await getData<AlertConfigsResponse>("/api/alert-configs");
    return response.alertConfigs ?? [];
}

export async function updateAlertConfigApi(
    id: number,
    data: UpdateAlertConfigPayload,
) {
    return await patchData("/api/alert-configs/" + id, data);
}