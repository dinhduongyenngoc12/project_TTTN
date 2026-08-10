import {
    getData,
    patchData,
    postData,
} from "../services/http";

//Trạng thái cấp phép của bộ đo IoT
export type IotDeviceStatus = "active" | "disabled";

//Trạng thái kết nối được backend suy ra từ last_seen_at
export type IotConnectionStatus = "online" | "offline";

//Thiết bị gia dụng đang được bộ đo theo dõi
export type LinkedDevice = {
    id: number;
    user_id: number;
    name: string;
    device_type: string;
    status: "active" | "inactive";
};

//Thông tin một bộ đo IoT trả về trong danh sách
export type IotDeviceItem = {
    id: number;
    iot_key: string;
    status: IotDeviceStatus;

    last_seen_at: string | null;
    created_at: string;
    updated_at: string | null;

    connection_status: IotConnectionStatus;

    //null khi bộ đo chưa theo dõi thiết bị nào
    linked_device: LinkedDevice | null;
};

//Bộ lọc dùng khi lấy danh sách bộ đo
export type IotDeviceFilters = {
    keyword?: string;
    status?: IotDeviceStatus | "";
};

// PAYLOAD
//Admin chỉ nhập API Key khi thêm bộ đo
export type CreateIotDevicePayload = {
    iot_key: string;
};

//Response lấy danh sách bộ đo
export type IotDevicesResponse = {
    status: string;

    filters: {
        keyword: string;
        status: string;
    };

    iotDevices: IotDeviceItem[];
};

//Response thêm bộ đo
export type CreateIotDeviceResponse = {
    status: string;
    message: string;
    iotDevice: {
        id: number;
        iot_key: string;
        status: IotDeviceStatus;
        last_seen_at: string | null;
        created_at: string;
        updated_at: string | null;
    };
};

//Thiết bị bị ảnh hưởng khi admin vô hiệu hóa bộ đo
export type AffectedDevice = {
    id: number;
    name: string;
};

//Response vô hiệu hóa bộ đo
export type DisableIotDeviceResponse = {
    status: string;
    message: string;

    data: {
        iot_device: {
            id: number;
            iot_key: string;
            status: IotDeviceStatus;
            updated_at: string | null;
        };

        affected_devices: AffectedDevice[];
    };
};

//Response kích hoạt lại bộ đo
export type EnableIotDeviceResponse = {
    status: string;
    message: string;

    iotDevice: {
        id: number;
        iot_key: string;
        status: IotDeviceStatus;
        updated_at: string | null;
    };
};

//Lấy danh sách bộ đo IoT
export async function getIotDevicesApi(
    filters: IotDeviceFilters = {},
): Promise<IotDevicesResponse> {
    return await getData<IotDevicesResponse>(
        "/api/iot-devices",
        {
            keyword: filters.keyword ?? "",
            status: filters.status ?? ""
        },
    );
}

//Thêm bộ đo IoT mới
export async function createIotDeviceApi(
    data: CreateIotDevicePayload,
): Promise<CreateIotDeviceResponse> {
    return await postData<
        CreateIotDeviceResponse,
        CreateIotDevicePayload
    >(
        "/api/iot-devices",
        data
    );
}

//Vô hiệu hóa bộ đo IoT
export async function disableIotDeviceApi(
    id: number,
): Promise<DisableIotDeviceResponse> {
    return await patchData<DisableIotDeviceResponse>(
        "/api/iot-devices/" + id + "/disable"     //không cần body
    );
}

//Kích hoạt lại bộ đo IoT
export async function enableIotDeviceApi(
    id: number,
): Promise<EnableIotDeviceResponse> {
    return await patchData<EnableIotDeviceResponse>(
        "/api/iot-devices/" + id + "/enable"
    );
}