import type { DeviceStatus } from "../../../api/deviceApi";

// Danh sách loại thiết bị cố định để dùng trong form thêm/sửa.
export const DEVICE_TYPES = [
    "Tủ lạnh",
    "Máy lạnh",
    "Máy giặt",
    "Quạt điện",
    "Tivi",
    "Máy bơm nước",
    "Bình nóng lạnh",
    "Nồi cơm điện",
    "Lò vi sóng",
    "Nồi chiên không dầu",
    "Bếp điện",
    "Máy sấy tóc",
    "Bàn là điện",
    "Bóng đèn",
    "Lọc hồ cá",
    "Sạc điện thoại",
    "Sạc Laptop",
    "Khác",
];

//Record dùng để khai báo object có key là DeviceStatus và value là string
//Mục đích: chuyển status từ backend sang nhãn tiếng Việt để hiển thị
export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
    active: "Đang hoạt động",
    inactive: "Đã dừng hoạt động",
};


export function getConnectionStatus(
    lastSeenAt?: string | null,
    deviceStatus: DeviceStatus = "active",
): "online" | "offline" {
    // Device inactive không còn liên kết hoạt động với bộ đo nên không được
    // suy ra online từ last_seen_at lịch sử hoặc dữ liệu API cũ.
    if (deviceStatus !== "active") {
        return "offline";
    }

    if (!lastSeenAt) {
        return "offline";
    }

    const lastSeenTimestamp = new Date(lastSeenAt).getTime();

    if (!Number.isFinite(lastSeenTimestamp)) {
        return "offline";
    }

    const differenceInSeconds =
        (Date.now() - lastSeenTimestamp) / 1000;

    return differenceInSeconds >= 0
        && differenceInSeconds <= 30
            ? "online"
            : "offline";
}

//format thoi gian
export function formatDeviceDateTime(value?: string | null): string {
    if (!value) {
        return "Chưa có dữ liệu";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "Chưa có dữ liệu";
    }

    return date.toLocaleString("vi-VN");
}

//cong suat dinh muc user nhap
export function formatRatedPower(value?: number | null): string {
    if (value === null || value === undefined) {
        return "Chưa nhập";
    }

    return Number(value).toLocaleString("vi-VN") + " W";
}
