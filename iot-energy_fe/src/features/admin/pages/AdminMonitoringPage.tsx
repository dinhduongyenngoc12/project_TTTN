import axios from "axios";
import { useEffect, useState } from "react";

import {
    getSystemAlertsApi,
    type SystemAlertItem,
} from "../../../api/adminMonitoringApi";
import AdminLayout from "../../../layouts/AdminLayout";

function formatPower(value: number): string {
    return value.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
    }) + " W";
}

function formatAlertTime(value: string): string {
    const alertTime = new Date(value);

    if (!Number.isFinite(alertTime.getTime())) {
        return "Chưa có dữ liệu";
    }

    return alertTime.toLocaleString("vi-VN");
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string" && message.trim() !== "") {
            return message;
        }
    }

    return "Không thể tải dữ liệu giám sát.";
}

export default function AdminMonitoringPage() {
    const [alerts, setAlerts] = useState<SystemAlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadSystemAlerts() {
            try {
                const response = await getSystemAlertsApi();
                setAlerts(response.alerts ?? []);
            } catch (error: unknown) {
                setAlerts([]);
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }

        // Danh sách chỉ tải một lần khi Admin mở trang giám sát.
        void loadSystemAlerts();
    }, []);

    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Giám sát hệ thống
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Theo dõi 20 cảnh báo vượt ngưỡng mới nhất.
                </p>
            </header>

            {errorMessage && (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {loading ? (
                    <p className="p-6 text-sm text-slate-600">
                        Đang tải dữ liệu...
                    </p>
                ) : alerts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                        Chưa có cảnh báo trên hệ thống.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Người dùng</th>
                                    <th className="px-5 py-3 font-medium">Thiết bị</th>
                                    <th className="px-5 py-3 font-medium">Công suất</th>
                                    <th className="px-5 py-3 font-medium">Ngưỡng</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => (
                                    <tr key={alert.id}
                                        className="border-b border-slate-100 last:border-0">
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {alert.username}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {alert.device_name}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-red-600">
                                            {formatPower(alert.power_value)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {formatPower(alert.threshold_value)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {alert.email_sent ? "Đã gửi" : "Không gửi"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {formatAlertTime(alert.created_at)}
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
