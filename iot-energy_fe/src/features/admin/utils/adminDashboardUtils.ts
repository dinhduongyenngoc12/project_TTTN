// import type { DashboardDevice, DashboardSummary } from "../../main/utils/homeDashboard";
// import { buildDashboardSummary } from "../../main/utils/homeDashboard";

// export type AdminUserSummary = {
//     username: string;
//     totalDevices: number;
//     activeDevices: number;
//     overThresholdDevices: number;
//     totalPower: number;
// };

// export type AdminDashboardSummary = DashboardSummary & {
//     totalUsers: number;
//     usersWithAlerts: number;
//     devicesWithoutAlertConfig: number;
// };

// export type AdminDashboardData = {
//     summary: AdminDashboardSummary;
//     userSummaries: AdminUserSummary[];
//     alertDevices: DashboardDevice[];
//     topConsumers: DashboardDevice[];
//     devicesWithoutAlertConfig: DashboardDevice[];
// };

// function getUsernameLabel(username: string | null | undefined): string {
//     return username?.trim() || "Chua gan user";
// }

// export function buildAdminDashboardData(devices: DashboardDevice[], totalUsers = 0): AdminDashboardData {
//     const baseSummary = buildDashboardSummary(devices);
//     const userMap = new Map<string, AdminUserSummary>();
//     const alertDevices = devices
//         .filter((device) => device.isOverThreshold)
//         .sort((left, right) => (right.latestPower ?? 0) - (left.latestPower ?? 0));
//     const topConsumers = [...devices]
//         .sort((left, right) => (right.latestPower ?? 0) - (left.latestPower ?? 0))
//         .slice(0, 5);
//     const devicesWithoutAlertConfig = devices.filter((device) => device.maxPower === null);

//     for (const device of devices) {
//         const username = getUsernameLabel(device.username);
//         const currentSummary = userMap.get(username) ?? {
//             username,
//             totalDevices: 0,
//             activeDevices: 0,
//             overThresholdDevices: 0,
//             totalPower: 0,
//         };

//         currentSummary.totalDevices += 1;
//         currentSummary.activeDevices += device.isActive ? 1 : 0;
//         currentSummary.overThresholdDevices += device.isOverThreshold ? 1 : 0;
//         currentSummary.totalPower += device.latestPower ?? 0;

//         userMap.set(username, currentSummary);
//     }

//     const userSummaries = [...userMap.values()].sort((left, right) => {
//         if (right.overThresholdDevices !== left.overThresholdDevices) {
//             return right.overThresholdDevices - left.overThresholdDevices;
//         }

//         return right.totalPower - left.totalPower;
//     });

//     return {
//         summary: {
//             ...baseSummary,
//             totalUsers,
//             usersWithAlerts: userSummaries.filter((item) => item.overThresholdDevices > 0).length,
//             devicesWithoutAlertConfig: devicesWithoutAlertConfig.length,
//         },
//         userSummaries,
//         alertDevices,
//         topConsumers,
//         devicesWithoutAlertConfig,
//     };
// }

// export function createEmptyAdminDashboardData(): AdminDashboardData {
//     return {
//         summary: {
//             totalPower: 0,
//             activeDevices: 0,
//             overThresholdDevices: 0,
//             totalDevices: 0,
//             totalUsers: 0,
//             usersWithAlerts: 0,
//             devicesWithoutAlertConfig: 0,
//         },
//         userSummaries: [],
//         alertDevices: [],
//         topConsumers: [],
//         devicesWithoutAlertConfig: [],
//     };
// }
