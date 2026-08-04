import axios from "axios";
import { useEffect, useState } from "react";

import {
    createElectricityPriceApi,
    deleteElectricityPriceApi,
    getElectricityPricesApi,
    updateElectricityPriceApi,
    type ElectricityPricePayload,
    type ElectricityPriceTier,
} from "../../../api/electricityPriceApi";
import AdminLayout from "../../../layouts/AdminLayout";
import PriceTierFormModal from "../components/PriceTierFormModal";
import { formatDate, formatPrice, formatTierRange } from "../utils/ePriceUtils";

type Feedback = {
    type: "success" | "error";
    message: string;
};

export default function ElectricityPricePage() {
    const [tiers, setTiers] = useState<ElectricityPriceTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<ElectricityPriceTier | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    function getErrorMessage(error: unknown, defaultMessage: string): string {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message;

            if (typeof message === "string" && message.trim() !== "") {
                return message;
            }
        }

        return defaultMessage;
    }

    async function loadElectricityPrices() {
        setLoading(true);

        try {
            const response = await getElectricityPricesApi();
            setTiers(response.electricityPriceTiers ?? []);
        } catch (error: unknown) {
            setTiers([]);
            setFeedback({
                type: "error",
                message: getErrorMessage(error, "Không thể tải biểu giá điện."),
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function loadInitialPrices() {
            try {
                const response = await getElectricityPricesApi();
                setTiers(response.electricityPriceTiers ?? []);
            } catch (error: unknown) {
                setTiers([]);
                setFeedback({
                    type: "error",
                    message: getErrorMessage(error, "Không thể tải biểu giá điện."),
                });
            } finally {
                setLoading(false);
            }
        }

        void loadInitialPrices();
    }, []);

    function openCreateModal() {
        setSelectedTier(null);
        setFeedback(null);
        setIsModalOpen(true);
    }

    function openEditModal(tier: ElectricityPriceTier) {
        setSelectedTier(tier);
        setFeedback(null);
        setIsModalOpen(true);
    }

    async function handleSavePriceTier(payload: ElectricityPricePayload) {
        setSubmitting(true);
        setFeedback(null);

        try {
            const response = selectedTier
                ? await updateElectricityPriceApi(selectedTier.id, payload)
                : await createElectricityPriceApi(payload);

            setFeedback({
                type: "success",
                message: response.message ?? "Đã lưu bậc giá.",
            });
            setIsModalOpen(false);

            // Tải lại để bảng luôn phản ánh dữ liệu mới nhất từ backend.
            await loadElectricityPrices();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error, "Không thể lưu bậc giá điện."),
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeletePriceTier(tier: ElectricityPriceTier) {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa bậc ${tier.tier_order}?`,
        );

        if (!confirmed) return;

        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await deleteElectricityPriceApi(tier.id);
            setFeedback({ type: "success", message: response.message });
            await loadElectricityPrices();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error, "Không thể xóa bậc giá điện."),
            });
        } finally {
            setSubmitting(false);
        }
    }

    function canChangeTier(tier: ElectricityPriceTier): boolean {
        // Chuỗi YYYY-MM-DD có thể so sánh trực tiếp theo thứ tự thời gian.
        const today = new Date().toLocaleDateString("en-CA");
        return tier.effective_from.slice(0, 10) > today;
    }

    return (
        <AdminLayout>
            <header className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300">
                    Biểu giá điện
                </p>
                <h2 className="mt-3 text-3xl font-bold">Quản lý biểu giá điện</h2>
            </header>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Danh sách bậc giá</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Chỉ được thay đổi bảng giá chưa có hiệu lực.
                        </p>
                    </div>
                    <button type="button" onClick={openCreateModal}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
                        Thêm bậc giá
                    </button>
                </div>

                {feedback && (
                    <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"}`}>
                        {feedback.message}
                    </p>
                )}

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-3">Bậc</th>
                                    <th className="py-3">Khoảng tiêu thụ</th>
                                    <th className="py-3">Đơn giá</th>
                                    <th className="py-3">Ngày áp dụng</th>
                                    <th className="py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiers.map((tier) => (
                                    <tr key={tier.id} className="border-b border-slate-100">
                                        <td className="py-4">Bậc {tier.tier_order}</td>
                                        <td className="py-4">
                                            {formatTierRange(tier.from_kwh, tier.to_kwh)}
                                        </td>
                                        <td className="py-4">{formatPrice(tier.price_kwh)}</td>
                                        <td className="py-4">{formatDate(tier.effective_from)}</td>
                                        <td className="py-4 text-right">
                                            {canChangeTier(tier) ? (
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" onClick={() => openEditModal(tier)}
                                                        disabled={submitting}
                                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                                        Sửa
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => void handleDeletePriceTier(tier)}
                                                        disabled={submitting}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                                                        Xóa
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">Đã khóa</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {tiers.length === 0 && (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Chưa có bậc giá điện.
                            </p>
                        )}
                    </div>
                )}
            </section>

            <PriceTierFormModal
                key={`${isModalOpen}-${selectedTier?.id ?? "new"}`}
                isOpen={isModalOpen}
                submitting={submitting}
                selectedTier={selectedTier}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSavePriceTier}
            />
        </AdminLayout>
    );
}
