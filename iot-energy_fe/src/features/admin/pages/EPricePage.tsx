import { useEffect, useState } from "react";

import { formatDate, formatPrice, formatTierRange } from "../utils/ePriceUtils";
import { getElectricityPricesApi, type ElectricityPriceTier } from "../../../api/electricityPriceApi";
import AdminLayout from "../../../layouts/AdminLayout";

export default function ElectricityPricePage() {
    const [tiers, setTiers] = useState<ElectricityPriceTier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPrices() {
            try {
                const response = await getElectricityPricesApi();
                setTiers(response.electricityPriceTiers ?? []);
            } finally {
                setLoading(false);
            }
        }

        void loadPrices();
    }, []);

    return (
        <AdminLayout>
            <header className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300">
                    Biểu giá điện
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                    Quản lý biểu giá điện
                </h2>
            </header>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white p-6">
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
                                </tr>
                            </thead>

                            <tbody>
                                {tiers.map((tier) => (
                                    <tr
                                        key={tier.id}
                                        className="border-b border-slate-100"
                                    >
                                        <td className="py-4">
                                            Bậc {tier.tier_order}
                                        </td>

                                        <td className="py-4">
                                            {formatTierRange(
                                                tier.from_kwh,
                                                tier.to_kwh,
                                            )}
                                        </td>

                                        <td className="py-4">
                                            {formatPrice(tier.price_kwh)}
                                        </td>

                                        <td className="py-4">
                                            {formatDate(
                                                tier.effective_from,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}