import { getData } from "../../services/http";

export type UserProfile = {
    id: number;
    username: string | null;
    email: string | null;
    role?: string | null;
};

export type MeResponse = {
    status: string;
    user: UserProfile;
};

export type DeviceItem = {
    pk?: number;
    id?: number;
    name: string;
    photo_path?: string | null;
    user_id?: number | null;
    username?: string | null;
};

export type DevicesResponse = {
    status: string;
    message: string;
    keyword: string;
    devices: DeviceItem[];
    pagingData: Record<string, unknown>;
};

export type EnergyLogItem = {
    id: number;
    device_id?: number | null;
    power?: number | null;
    created_at?: string | null;
    device?: {
        id?: number;
        name?: string;
    };
};

export type EnergyLogsResponse = {
    status: string;
    filters?: {
        device_id?: number | null;
        from?: string | null;
        to?: string | null;
    };
    energyLogs: EnergyLogItem[];
};

export type ThresholdItem = {
    id: number;
    device_id?: number | null;
    max_power?: number | null;
};

export type ThresholdsResponse = {
    status: string;
    thresholds: ThresholdItem[];
};

export async function getMeApi(): Promise<MeResponse> {
    const response = await getData<MeResponse>("/api/auth/me");
    return response.data;
}

export async function getDevicesApi(): Promise<DevicesResponse> {
    const response = await getData<DevicesResponse>("/api/devices");
    return response.data;
}

export async function getEnergyLogsApi(params?: Record<string, unknown>): Promise<EnergyLogsResponse> {
    const response = await getData<EnergyLogsResponse>("/api/energy-logs", params);
    return response.data;
}

export async function getThresholdsApi(): Promise<ThresholdsResponse> {
    const response = await getData<ThresholdsResponse>("/api/thresholds");
    return response.data;
}
