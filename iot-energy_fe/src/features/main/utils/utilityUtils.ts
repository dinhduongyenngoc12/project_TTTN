//Các mức VAT được phép sử dụng trong chức năng ước tính
export type VatRate = 0 | 8 | 10;

//Danh sách mức VAT dùng cho thẻ select
export const VAT_OPTIONS: Array<{
    value: VatRate;
    label: string;
}> = [
    {
        value: 0,
        label: "Không tính VAT",
    },
    {
        value: 8,
        label: "VAT 8%",
    },
    {
        value: 10,
        label: "VAT 10%",
    },
];

//Định dạng số tiền theo đơn vị đồng Việt Nam
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

//Định dạng điện năng theo đơn vị kWh
export function formatEnergy(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(value) + " kWh";
}

//Định dạng đơn giá điện
export function formatElectricityPrice(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2,
    }).format(value) + " đ/kWh";
}

//Định dạng ngày theo ngôn ngữ Việt Nam
export function formatUtilityDate(
    value: string | null,
): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleDateString("vi-VN");
}

//Định dạng ngày và giờ của ghi chú
export function formatUtilityDateTime(
    value: string | null,
): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("vi-VN");
}

//Lấy tháng hiện tại theo định dạng mà input type="month" sử dụng
export function getCurrentMonthValue(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(
        currentDate.getMonth() + 1,
    ).padStart(2, "0");

    return year + "-" + month;
}

//Hiển thị khoảng điện năng của từng bậc giá
export function formatTierRange(
    fromKwh: number,
    toKwh: number | null,
): string {
    if (toKwh === null) {
        return "Trên " + fromKwh + " kWh";
    }

    return fromKwh + " - " + toKwh + " kWh";
}