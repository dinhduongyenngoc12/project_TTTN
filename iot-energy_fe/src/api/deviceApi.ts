import { getData, patchData, postData } from "../services/http";

//=====================================================
// DEVICE
//=====================================================

//Trạng thái của thiết bị trong bảng devices
export type DeviceStatus = "active" | "inactive";

//Trạng thái của bộ đo IoT trong bảng iot_devices
export type IotDeviceStatus = "active" | "disabled";

//Thông tin thiết bị trả về từ API danh sách thiết bị
export type DeviceItem = {
    id: number;

    user_id: number | null;
    iot_device_id: number | null;

    name: string;
    device_type: string;
    rated_power: number | null;

    status: DeviceStatus;

    activated_at: string | null;
    created_at: string | null;
    updated_at: string | null;

    //Các trường backend trả thêm khi join bảng users và iot_devices
    username?: string | null;

    //Đây là tên alias trong JSON response, không phải tên cột DB (tránh trùng)
    iot_api_key?: string | null;
    iot_status?: IotDeviceStatus | null;
    iot_last_seen_at?: string | null;
};

//FORM
//Dữ liệu dùng chung cho form thêm và sửa thiết bị
export type DeviceFormData = {
    api_key: string;
    name: string;
    device_type: string;
    rated_power: number | null;
};

//Payload dùng khi thêm thiết bị
//Backend cần API Key để xác định bộ đo IoT
export type CreateDevicePayload = {
    api_key: string;
    name: string;
    device_type: string;
    rated_power: number | null;
};

//Payload dùng khi cập nhật thiết bị
//Không cho phép cập nhật API Key và liên kết bộ đo
export type UpdateDevicePayload = {
    name: string;
    device_type: string;
    rated_power: number | null;
};

//=====================================================
// RESPONSE
//=====================================================

export type DevicesResponse = {
    status: string;
    message?: string;
    keyword?: string;
    devices: DeviceItem[];
    pagingData?: Record<string, unknown>;
};

export type DeviceMutationResponse = {
    status: string;
    message?: string;
    device?: DeviceItem;
    errors?: Record<string, Record<string, string>>;
};

//=====================================================
// API
//=====================================================

//Lấy danh sách thiết bị của người dùng
export async function getDevicesApi(): Promise<DevicesResponse> {
    return await getData<DevicesResponse>("/api/devices");
}

//Thêm thiết bị mới và liên kết với bộ đo bằng API Key
export async function createDeviceApi(
    data: CreateDevicePayload,
): Promise<DeviceMutationResponse> {
    return await postData<DeviceMutationResponse, CreateDevicePayload>(
        "/api/devices",
        data,
    );
}

//Cập nhật thông tin thiết bị
export async function updateDeviceApi(
    id: number,
    data: UpdateDevicePayload,
): Promise<DeviceMutationResponse> {
    return await patchData<DeviceMutationResponse, UpdateDevicePayload>(
        "/api/devices/" + id,
        data,
    );
}

//=====================================================
// DEVICE DETAIL
//=====================================================

export type DeviceConnectionStatus = "online" | "offline";

export type DeviceLatestLog = {
    voltage: number | null;
    current: number | null;
    power: number | null;
    energy: number | null;
    created_at: string | null;
};

export type DeviceAlertConfig = {
    power_threshold: number | null;
    default_threshold: number | null;
    mode: string | null;
    learning_status: string | null;
};

export type DeviceLatestAlert = {
    id: number;
    power_value: number | null;
    email_sent: boolean | number;
    created_at: string | null;
};

export type DeviceDetailItem = {
    id: number;
    name: string;
    device_type: string;
    rated_power: number | null;
    status: DeviceStatus;

    //API chi tiết đang trả trường này trong object device
    last_seen_at: string | null;
    connection_status: DeviceConnectionStatus;
};

export type DeviceDetailData = {
    device: DeviceDetailItem;
    latest_log: DeviceLatestLog | null;
    alert_config: DeviceAlertConfig | null;
    latest_alert: DeviceLatestAlert | null;
};

export type DeviceDetailSuccessResponse = {
    success: true;
    data: DeviceDetailData;
};

export type DeviceDetailErrorResponse = {
    success: false;
    message: string;
};

export type DeviceDetailResponse =
    | DeviceDetailSuccessResponse
    | DeviceDetailErrorResponse;

//Lấy chi tiết thiết bị
export async function getDeviceDetailApi(
    id: number,
): Promise<DeviceDetailData> {
    const response = await getData<DeviceDetailResponse>(
        "/api/devices/" + id,
    );

    if (!response.success) {
        throw new Error(response.message);
    }

    return response.data;
}