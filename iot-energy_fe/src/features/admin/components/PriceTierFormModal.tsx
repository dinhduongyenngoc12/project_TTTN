import { useState } from "react";

import type {
    ElectricityPricePayload,
    ElectricityPriceTier,
} from "../../../api/electricityPriceApi";

type PriceTierFormModalProps = {
    isOpen: boolean;
    submitting: boolean;
    selectedTier: ElectricityPriceTier | null;
    onClose: () => void;
    onSubmit: (payload: ElectricityPricePayload) => Promise<void>;
};

export default function PriceTierFormModal({
    isOpen,
    submitting,
    selectedTier,
    onClose,
    onSubmit,
}: PriceTierFormModalProps) {
    //Component được tạo lại mỗi lần mở nên state luôn nhận đúng dữ liệu thêm hoặc sửa
    const [tierOrder, setTierOrder] = useState(
        selectedTier ? String(selectedTier.tier_order) : "",
    );
    const [fromKwh, setFromKwh] = useState(selectedTier?.from_kwh ?? "");
    const [toKwh, setToKwh] = useState(selectedTier?.to_kwh ?? "");
    const [priceKwh, setPriceKwh] = useState(selectedTier?.price_kwh ?? "");
    const [effectiveFrom, setEffectiveFrom] = useState(
        selectedTier?.effective_from.slice(0, 10) ?? "",
    );
    const [error, setError] = useState("");

    if (!isOpen) return null;

    async function handleSubmit() {
        const parsedTierOrder = Number(tierOrder);
        const parsedFromKwh = Number(fromKwh);
        const parsedToKwh = toKwh === "" ? null : Number(toKwh);
        const parsedPriceKwh = Number(priceKwh);

        if (!Number.isInteger(parsedTierOrder) || parsedTierOrder < 1) {
            setError("Bậc giá phải là số nguyên từ 1 trở lên.");
            return;
        }
        if (fromKwh === "" || !Number.isFinite(parsedFromKwh) || parsedFromKwh < 0) {
            setError("Mức bắt đầu phải là số lớn hơn hoặc bằng 0.");
            return;
        }
        if (parsedToKwh !== null && (!Number.isFinite(parsedToKwh) || parsedToKwh <= parsedFromKwh)) {
            setError("Mức kết thúc phải lớn hơn mức bắt đầu.");
            return;
        }
        if (priceKwh === "" || !Number.isFinite(parsedPriceKwh) || parsedPriceKwh <= 0) {
            setError("Đơn giá phải là số lớn hơn 0.");
            return;
        }
        if (effectiveFrom === "") {
            setError("Vui lòng chọn ngày áp dụng.");
            return;
        }

        setError("");

        //Backend tiếp tục kiểm tra ngày áp dụng, trùng bậc và khoảng chồng lấn
        await onSubmit({
            tier_order: parsedTierOrder,
            from_kwh: parsedFromKwh,
            to_kwh: parsedToKwh,
            price_kwh: parsedPriceKwh,
            effective_from: effectiveFrom,
        });
    }

    function handleClose() {
        if (!submitting) onClose();
    }

    const inputClassName = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {selectedTier ? "Sửa bậc giá" : "Thêm bậc giá"}
                    </h2>
                    <button type="button" onClick={handleClose} disabled={submitting}
                        className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                        Đóng
                    </button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                        Bậc giá
                        <input type="number" min="1" step="1" value={tierOrder}
                            onChange={(event) => setTierOrder(event.target.value)} disabled={submitting}
                            className={inputClassName} />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Đơn giá (đ/kWh)
                        <input type="number" min="1" step="0.01" value={priceKwh}
                            onChange={(event) => setPriceKwh(event.target.value)} disabled={submitting}
                            className={inputClassName} />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Từ kWh
                        <input type="number" min="0" step="0.01" value={fromKwh}
                            onChange={(event) => setFromKwh(event.target.value)} disabled={submitting}
                            className={inputClassName} />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Đến kWh
                        <input type="number" min="0" step="0.01" value={toKwh}
                            onChange={(event) => setToKwh(event.target.value)} disabled={submitting}
                            placeholder="Để trống nếu không giới hạn" className={inputClassName} />
                    </label>
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Ngày áp dụng
                        <input type="date" value={effectiveFrom}
                            onChange={(event) => setEffectiveFrom(event.target.value)} disabled={submitting}
                            className={inputClassName} />
                    </label>
                </div>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={handleClose} disabled={submitting}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Hủy
                    </button>
                    <button type="submit" disabled={submitting}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                        {submitting ? "Đang lưu..." : "Lưu bậc giá"}
                    </button>
                </div>
            </form>
        </div>
    );
}
