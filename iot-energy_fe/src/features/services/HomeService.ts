import { getData } from "../../services/http";
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
    energyLogs: EnergyLogItem[];
};

export async function getDevicesApi(): Promise<DevicesResponse> {
    const response = await getData<DevicesResponse>("/api/devices");
    return response.data;
}

export async function getEnergyLogsApi(): Promise<EnergyLogsResponse> {
    const response = await getData<EnergyLogsResponse>("/api/energy-logs");
    return response.data;
}



