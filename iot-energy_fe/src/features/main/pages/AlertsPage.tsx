import axios from "axios";
import { useEffect, useState } from "react";

import {
    getAlertsApi,
    type AlertItem,
    type AlertPagination,
} from "../../../api/alertApi";
import {
    getDevicesApi,
    type DeviceItem,
} from "../../../api/deviceApi";
import UserLayout from "../../../layouts/UserLayout";

const DEFAULT_PAGINATION: AlertPagination = {
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 0,
};

function formatPower(value: number | string): string {
    const power = Number(value);

    return Number.isFinite(power)
        ? power.toLocaleString("vi-VN", {
            maximumFractionDigits: 2,
        }) + " W"
        : "Chưa có dữ liệu";
}

function formatHistoricalThreshold(
    value: number | string,
): string {
    const threshold = Number(value);

    // Không thay ngưỡng cũ bằng ngưỡng hiện tại vì sẽ làm sai lịch sử.
    if (!Number.isFinite(threshold) || threshold <= 0) {
        return "Ngưỡng cũ không hợp lệ";
    }

    return formatPower(threshold);
}

function formatAlertTime(value: string): string {
    const date = new Date(value);

    return Number.isFinite(date.getTime())
        ? date.toLocaleString("vi-VN")
        : "Chưa có dữ liệu";
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message
            ?? "Không thể tải lịch sử cảnh báo.";
    }

    return "Không thể tải lịch sử cảnh báo.";
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [pagination, setPagination] =
        useState<AlertPagination>(DEFAULT_PAGINATION);

    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Tải thiết bị để người dùng chỉ chọn trong danh sách của mình.
    async function loadDevices() {
        try {
            const response = await getDevicesApi();
            setDevices(response.devices ?? []);
        } catch {
            // Bộ lọc thiết bị là phần hỗ trợ, không chặn danh sách cảnh báo.
            setDevices([]);
        }
    }

    async function loadAlerts(
        page = 1,
        filters = {
            deviceId: selectedDeviceId,
            from: fromDate,
            to: toDate,
        },
    ) {
        setLoading(true);
        setError("");

        try {
            const response = await getAlertsApi({
                device_id: filters.deviceId
                    ? Number(filters.deviceId)
                    : undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                page,
                limit: pagination.limit,
            });

            setAlerts(response.alerts ?? []);
            setPagination(
                response.pagination ?? DEFAULT_PAGINATION,
            );
        } catch (requestError) {
            setAlerts([]);
            setPagination(DEFAULT_PAGINATION);
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    function handleFilterAlerts() {
        // Khi đổi bộ lọc, luôn quay về trang đầu tiên.
        void loadAlerts(1);
    }

    function handleClearFilters() {
        setSelectedDeviceId("");
        setFromDate("");
        setToDate("");

        // Truyền trực tiếp bộ lọc rỗng vì cập nhật state không diễn ra tức thì.
        void loadAlerts(1, {
            deviceId: "",
            from: "",
            to: "",
        });
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadDevices();
        void loadAlerts();
        // Chỉ tải lần đầu; các lần lọc do người dùng bấm nút.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Cảnh báo
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Lịch sử vượt ngưỡng
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                    Theo dõi các lần công suất thiết bị vượt ngưỡng đã cài đặt.
                </p>
            </header>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm font-medium text-slate-700">
                        Thiết bị
                        <select
                            value={selectedDeviceId}
                            onChange={(event) =>
                                setSelectedDeviceId(event.target.value)
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500"
                        >
                            <option value="">Tất cả thiết bị</option>
                            {devices.map((device) => (
                                <option
                                    key={device.id}
                                    value={device.id}
                                >
                                    {device.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        Từ ngày
                        <input
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500"
                        />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        Đến ngày
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(event) =>
                                setToDate(event.target.value)
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500"
                        />
                    </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleFilterAlerts}
                        disabled={loading}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Xem cảnh báo
                    </button>

                    <button
                        type="button"
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </section>

            <section className="mt-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Danh sách cảnh báo
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Tổng cộng {pagination.total_items} cảnh báo.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                        Đang tải lịch sử cảnh báo...
                    </div>
                ) : alerts.length === 0 && !error ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                        Chưa có cảnh báo phù hợp với bộ lọc.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Thiết bị
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Công suất đo
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Ngưỡng
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Thời gian
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {alerts.map((alert) => (
                                    <tr
                                        key={alert.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900">
                                                {alert.device_name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {alert.device_type}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-red-600">
                                            {formatPower(alert.power_value)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {formatHistoricalThreshold(
                                                alert.threshold_value,
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {alert.email_sent
                                                ? "Đã gửi"
                                                : "Không gửi"}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {formatAlertTime(alert.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination.total_pages > 1 && (
                    <div className="mt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                void loadAlerts(pagination.page - 1)
                            }
                            disabled={loading || pagination.page <= 1}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Trang trước
                        </button>

                        <span className="text-sm text-slate-600">
                            Trang {pagination.page}/{pagination.total_pages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                void loadAlerts(pagination.page + 1)
                            }
                            disabled={
                                loading
                                || pagination.page >= pagination.total_pages
                            }
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </section>
        </UserLayout>
    );
}
