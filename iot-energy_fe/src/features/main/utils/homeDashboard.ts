import type {
    DeviceItem,
    EnergyLogItem,
    ThresholdItem,
} from "../../services/HomeService";

export type DashboardDevice = {
    id: number;
    name: string;
    username: string | null;
    photoUrl: string | null;
    latestPower: number | null;
    lastUpdated: string | null;
    maxPower: number | null;
    thresholdId: number | null;
    isActive: boolean;
    isOverThreshold: boolean;
};

export type DashboardSummary = {
    totalPower: number;
    activeDevices: number;
    overThresholdDevices: number;
    totalDevices: number;
};

export function buildDashboardDevices(
    devices: DeviceItem[],
    energyLogs: EnergyLogItem[],
    thresholds: ThresholdItem[],
): DashboardDevice[] {
    const latestLogByDevice = new Map<number, EnergyLogItem>();
    const thresholdByDevice = new Map<number, ThresholdItem>();

    for (const log of energyLogs) {
        const deviceId = normalizeId(log.device_id);
        if (deviceId === null) {
            continue;
        }

        const currentLatest = latestLogByDevice.get(deviceId);
        if (!currentLatest || isLogNewer(log, currentLatest)) {
            latestLogByDevice.set(deviceId, log);
        }
    }

    for (const threshold of thresholds) {
        const deviceId = normalizeId(threshold.device_id);
        if (deviceId === null || thresholdByDevice.has(deviceId)) {
            continue;
        }

        thresholdByDevice.set(deviceId, threshold);
    }

    return devices
        .map((device) => {
            const deviceId = normalizeId(device.id ?? device.pk);
            if (deviceId === null) {
                return null;
            }

            const latestLog = latestLogByDevice.get(deviceId);
            const threshold = thresholdByDevice.get(deviceId);
            const latestPower = normalizeNumber(latestLog?.power);
            const maxPower = normalizeNumber(threshold?.max_power);
            const isOverThreshold =
                latestPower !== null &&
                maxPower !== null &&
                latestPower > maxPower;

            return {
                id: deviceId,
                name: device.name,
                username: device.username ?? null,
                photoUrl: device.photo_path,
                latestPower,
                lastUpdated: latestLog?.created_at ?? null,
                maxPower,
                thresholdId: normalizeId(threshold?.id),
                isActive: latestPower !== null && latestPower > 0,
                isOverThreshold,
            };
        })
        .filter((device): device is DashboardDevice => device !== null);
}

export function buildDashboardSummary(devices: DashboardDevice[]): DashboardSummary {
    return devices.reduce<DashboardSummary>(
        (summary, device) => ({
            totalPower: summary.totalPower + (device.latestPower ?? 0),
            activeDevices: summary.activeDevices + (device.isActive ? 1 : 0),
            overThresholdDevices: summary.overThresholdDevices + (device.isOverThreshold ? 1 : 0),
            totalDevices: summary.totalDevices + 1,
        }),
        {
            totalPower: 0,
            activeDevices: 0,
            overThresholdDevices: 0,
            totalDevices: 0,
        },
    );
}

export function formatPower(power: number | null): string {
    if (power === null) {
        return "--";
    }

    return Math.round(power) + " W";  //lam tron
}

export function formatDateTime(value: string | null): string {
    if (!value) {
        return "Chưa có dữ liệu";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN");
}


function normalizeId(value: unknown): number | null {                  //ep kieu ve number
    return isFiniteNumber(value) ? Number(value) : null;
}

function normalizeNumber(value: unknown): number | null {
    return isFiniteNumber(value) ? Number(value) : null;
}

function isFiniteNumber(value: unknown): boolean {
    return typeof value === "number"
        ? Number.isFinite(value)        //so huu han
        : typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));           
}

function isLogNewer(nextLog: EnergyLogItem, currentLog: EnergyLogItem): boolean {          //tim log moi hon    
    const nextTimestamp = getLogTimestamp(nextLog);
    const currentTimestamp = getLogTimestamp(currentLog);

    if (nextTimestamp === currentTimestamp) {
        return nextLog.id > currentLog.id;
    }

    return nextTimestamp > currentTimestamp;
}

function getLogTimestamp(log: EnergyLogItem): number {
    if (!log.created_at) {
        return 0;
    }

    const parsed = Date.parse(log.created_at);
    return Number.isNaN(parsed) ? 0 : parsed;
}
