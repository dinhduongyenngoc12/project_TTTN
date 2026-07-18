import type {
    IotConnectionStatus,
    IotDeviceStatus,
} from "../../../api/iotDeviceApi";

//Hiển thị trạng thái bộ đo
export function getIotDeviceStatusLabel(
    status: IotDeviceStatus,
): string {
    switch (status) {
        case "active":
            return "Đang cấp phép";

        case "disabled":
            return "Đã vô hiệu hóa";

        default:
            return "";
    }
}

//Hiển thị trạng thái kết nối
export function getConnectionStatusLabel(
    status: IotConnectionStatus,
): string {
    switch (status) {
        case "online":
            return "Online";

        case "offline":
            return "Offline";

        default:
            return "";
    }
}

//Hiển thị tên thiết bị đang được bộ đo theo dõi
export function getLinkedDeviceLabel(
    deviceName: string | null | undefined,
): string {
    if (!deviceName) {
        return "Chưa liên kết";
    }

    return deviceName;
}

//Định dạng ngày giờ hiển thị
export function formatDateTime(
    value: string | null,
): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString(
        "vi-VN",
    );
}