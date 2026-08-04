import { useEffect, useState } from "react";
import UserLayout from "../../../layouts/UserLayout";
import {
    getAlertConfigsApi,
    updateAlertConfigApi,
    type AlertConfigItem,
    type AlertMode,
} from "../../../api/alertConfigApi";
import ThresholdConfigModal from "../components/ThresholdConfigModal";

function formatWatts(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") {
        return "--";
    }

    return Number(value) + " W";
}

function getLearningStatusLabel(status: string | null | undefined) {
    if (status === "learned_3d") {
        return "Đã học 3 ngày";
    }

    if (status === "learned_7d") {
        return "Đã học 7 ngày";
    }

    if (status === "adaptive") {
        return "Tự cập nhật theo 7 ngày gần nhất";
    }

    return "Đang học";
}

export default function ThresholdPage() {
    const [configs, setConfigs] = useState<AlertConfigItem[]>([]);
    const [selectedConfig, setSelectedConfig] =
        useState<AlertConfigItem | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function loadConfigs() {
        setLoading(true);
        setError("");

        try {
            const data = await getAlertConfigsApi();
            setConfigs(data);
        } catch {
            setConfigs([]);
            setError("Không thể tải danh sách cấu hình ngưỡng.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitConfig(data: {
        mode: AlertMode;
        power_threshold?: number | null;
    }) {
        if (!selectedConfig) {
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await updateAlertConfigApi(selectedConfig.id, data);
            await loadConfigs();
            setSelectedConfig(null);
        } catch {
            setError("Không thể cập nhật cấu hình ngưỡng.");
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        void loadConfigs();
    }, []);

    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Cấu hình ngưỡng
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Thiết lập ngưỡng tiêu thụ điện
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                    Khu vực cấu hình ngưỡng cảnh báo công suất cho từng thiết bị.
                </p>
            </header>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                {loading ? (
                    <p className="text-sm text-slate-500">
                        Đang tải cấu hình ngưỡng...
                    </p>
                ) : error ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : configs.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Chưa có cấu hình ngưỡng nào.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-3 pr-4">Thiết bị</th>
                                    <th className="py-3 pr-4">Loại</th>
                                    <th className="py-3 pr-4">Ngưỡng hệ thống đề xuất</th>
                                    <th className="py-3 pr-4">Ngưỡng đang áp dụng</th>
                                    <th className="py-3 pr-4">Chế độ</th>
                                    <th className="py-3 pr-4">Trạng thái tính ngưỡng tự động</th>
                                    <th className="py-3 pr-4 text-right">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {configs.map((config) => (
                                    <tr
                                        key={config.id}
                                        className="border-b border-slate-100"
                                    >
                                        <td className="py-4 pr-4 font-semibold text-slate-900">
                                            {config.device?.name ?? "--"}
                                        </td>

                                        <td className="py-4 pr-4 text-slate-600">
                                            {config.device?.device_type ?? "--"}
                                        </td>

                                        <td className="py-4 pr-4 text-slate-600">
                                            {formatWatts(config.default_threshold)}
                                        </td>

                                        <td className="py-4 pr-4 font-semibold text-slate-900">
                                            {formatWatts(config.power_threshold)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {config.mode === "auto"
                                                    ? "Tự động"
                                                    : "Thủ công"}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 text-slate-600">
                                            {getLearningStatusLabel(
                                                config.learning_status,
                                            )}
                                        </td>

                                        <td className="py-4 pr-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedConfig(config)
                                                }
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                            >
                                                Cấu hình
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ThresholdConfigModal
                isOpen={selectedConfig !== null}
                config={selectedConfig}
                submitting={submitting}
                onClose={() => setSelectedConfig(null)}
                onSubmit={handleSubmitConfig}
            />
        </UserLayout>
    );
}