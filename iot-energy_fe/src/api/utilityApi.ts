import { getData } from "../services/http";

//Thông tin chi tiết từng bậc điện sau khi tính toán.
export type TierDetail = {
    tier_order: number;
    from_kwh: number;
    to_kwh: number | null;
    used_kwh: number;
    price_kwh: number;
    amount: number;
};


//Kết quả ước tính tiền điện.
export type ElectricityCostEstimate = {
    year: number;
    month: number;
    month_label: string;
    total_energy: number;
    effective_from: string;
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
    tier_details: TierDetail[];
};

export type ElectricityCostResponse = {
    status: "success";
    message: string;
    data: ElectricityCostEstimate;
};

export type UtilityErrorResponse = {
    status: "error";
    message: string;
    errors?: Record<string, Record<string, string>>;
};

const UTILITIES_ENDPOINT = "/api/utilities";

//Ước tính tiền điện theo tháng.
export async function estimateElectricityCostApi(
    month: string,
    vat: number,
): Promise<ElectricityCostResponse> {
    return await getData<ElectricityCostResponse>(
        UTILITIES_ENDPOINT + "/electricity-cost",
        {
            month,
            vat,
        },
    );
}