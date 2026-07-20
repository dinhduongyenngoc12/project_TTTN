import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getDeviceDetailApi,
    type DeviceDetailData,
} from "../../../api/deviceApi";
import UserLayout from "../../../layouts/UserLayout";
import {
    DEVICE_STATUS_LABELS,
    formatDeviceDateTime,
    formatRatedPower,
} from "../utils/deviceUtils";

function formatMeasure(value?: number | null, unit = "") {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "--";
    }

    return value + (unit ? " " + unit : "");
}

export default function DeviceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detail, setDetail] = useState<DeviceDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDeviceDetail() {
            if (!id || Number.isNaN(Number(id))) {
                setError("Mã thiết bị không hợp lệ.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response = await getDeviceDetailApi(Number(id));
                setDetail(response);
            } catch {
                setDetail(null);
                setError("Không thể tải chi tiết thiết bị. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        }

        void loadDeviceDetail();
    }, [id]);

    const device = detail?.device ?? null;
    const latestLog = detail?.latest_log ?? null;
    const alertConfig = detail?.alert_config ?? null;
    const latestAlert = detail?.latest_alert ?? null;
    const isOnline = device?.connection_status === "online";

    return (
        <UserLayout>
            <header className="flex items-center justify-between rounded-2xl bg-slate-950 px-6 py-6 text-white">
                {/*trái */}
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                        Chi tiết thiết bị
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        {device?.name ?? "Thiết bị"}
                    </h1>

                </div>

                {/*phải */}
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/devices")}
                        className="inline-flex justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5">
                {loading ? (
                    <p className="text-sm text-slate-500">
                        Đang tải chi tiết thiết bị...
                    </p>
                ) : error ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : !device ? (
                    <p className="text-sm text-slate-500">
                        Không tìm thấy thiết bị.
                    </p>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Loại thiết bị</p>
                                <p className="mt-2 text-xl font-bold text-slate-900">
                                    {device.device_type || "Khác"}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Trạng thái kích hoạt</p>
                                <p className="mt-2 text-xl font-bold text-slate-900">
                                    {DEVICE_STATUS_LABELS[device.status] ?? device.status}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Kết nối</p>
                                <p
                                    className={
                                        "mt-2 text-xl font-bold " +
                                        (isOnline ? "text-emerald-600" : "text-slate-500")
                                    }
                                >
                                    {isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <article className="rounded-3xl border border-slate-200 bg-white p-5">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Thông tin thiết bị
                                </h3>

                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                    <p>
                                        Công suất định mức:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {formatRatedPower(device.rated_power)}
                                        </span>
                                    </p>

                                    <p>
                                        Lần gửi cuối:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {formatDeviceDateTime(device.last_seen_at)}
                                        </span>
                                    </p>

                                    <p>
                                        Ngưỡng cảnh báo:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {formatMeasure(
                                                alertConfig?.power_threshold ??
                                                alertConfig?.default_threshold,
                                                "W",
                                            )}
                                        </span>
                                    </p>

                                    <p>
                                        Chế độ ngưỡng:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {alertConfig?.mode ?? "--"}
                                        </span>
                                    </p>

                                    <p>
                                        Trạng thái học ngưỡng:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {alertConfig?.learning_status ?? "--"}
                                        </span>
                                    </p>
                                </div>
                            </article>

                            <article className="rounded-3xl border border-slate-200 bg-white p-5">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Thông số đo mới nhất
                                </h3>

                                {!latestLog ? (
                                    <p className="mt-4 text-sm text-slate-500">
                                        Chưa có dữ liệu đo.
                                    </p>
                                ) : (
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Công suất</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {formatMeasure(latestLog.power, "W")}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Điện áp</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {formatMeasure(latestLog.voltage, "V")}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Dòng điện</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {formatMeasure(latestLog.current, "A")}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Điện năng</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {formatMeasure(latestLog.energy, "kWh")}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                                            <p className="text-sm text-slate-500">Thời điểm đo</p>
                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                {formatDeviceDateTime(latestLog.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </article>
                        </div>

                        <article className="rounded-3xl border border-slate-200 bg-white p-5">
                            <h3 className="text-lg font-bold text-slate-900">
                                Cảnh báo gần nhất
                            </h3>

                            {!latestAlert ? (
                                <p className="mt-4 text-sm text-slate-500">
                                    Chưa có cảnh báo nào.
                                </p>
                            ) : (
                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl bg-rose-50 p-4">
                                        <p className="text-sm text-rose-600">
                                            Công suất vượt ngưỡng
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-rose-700">
                                            {formatMeasure(latestAlert.power_value, "W")}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">
                                            Trạng thái email
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            {latestAlert.email_sent ? "Đã gửi" : "Chưa gửi"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">
                                            Thời điểm cảnh báo
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            {formatDeviceDateTime(latestAlert.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </article>
                    </div>
                )}
            </section>
        </UserLayout>
    );
}