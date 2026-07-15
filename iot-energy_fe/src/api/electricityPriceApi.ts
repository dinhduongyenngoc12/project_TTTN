import {
    deleteData,
    getData,
    patchData,
    postData,
} from "../services/http";

//CakePHP DecimalType chuyển các cột decimal từ DB thành string.Vì DecimalType::toPHP() trả: return (string)$value;
//tier_order là int nên response vẫn là number.
//effective_from được serialize thành chuỗi ngày.

export type ElectricityPriceTier = {
    id: number;
    tier_order: number;
    from_kwh: string;
    to_kwh: string | null;
    price_kwh: string;
    effective_from: string;
};

export type ElectricityPriceResponse = {
    status: "success";
    electricityPriceTiers: ElectricityPriceTier[];
};

export type ElectricityPriceDetailResponse = {
    status: "success";
    message?: string;
    electricityPriceTier: ElectricityPriceTier;
};

export type ElectricityPriceErrorResponse = {
    status: "error";
    message: string;
    errors?: Record<string, Record<string, string>>;
};

//Payload form dùng number vì người dùng nhập dữ liệu số.
//CakePHP sẽ marshal các giá trị decimal sang string trước khi lưu.

export type ElectricityPricePayload = {
    tier_order: number;
    from_kwh: number;
    to_kwh: number | null;
    price_kwh: number;
    effective_from: string;
};

const PRICE_TIERS_ENDPOINT = "/api/price-tiers";

export async function getElectricityPricesApi():
    Promise<ElectricityPriceResponse> {
    return await getData<ElectricityPriceResponse>(
        PRICE_TIERS_ENDPOINT,
    );
}

export async function getElectricityPriceDetailApi(
    id: number,
): Promise<ElectricityPriceDetailResponse> {
    return await getData<ElectricityPriceDetailResponse>(
        PRICE_TIERS_ENDPOINT + "/" + id,
    );
}

export async function createElectricityPriceApi(
    payload: ElectricityPricePayload,
): Promise<ElectricityPriceDetailResponse> {
    return await postData<
        ElectricityPriceDetailResponse,
        ElectricityPricePayload
    >(
        PRICE_TIERS_ENDPOINT,
        payload,
    );
}

export async function updateElectricityPriceApi(
    id: number,
    payload: ElectricityPricePayload,
): Promise<ElectricityPriceDetailResponse> {
    return await patchData<
        ElectricityPriceDetailResponse,
        ElectricityPricePayload
    >(
        PRICE_TIERS_ENDPOINT + "/" + id,
        payload,
    );
}

export async function deleteElectricityPriceApi(
    id: number,
): Promise<{
    status: "success";
    message: string;
}> {
    return await deleteData<{
        status: "success";
        message: string;
    }>(
        PRICE_TIERS_ENDPOINT + "/" + id,
    );
}