import axios from "axios";
import { useEffect, useState } from "react";

import {
    getSystemDashboardApi,
    type SystemDashboardData,
} from "../../../api/dashboardApi";
import AdminLayout from "../../../layouts/AdminLayout";

type SummaryItem = {
    label: string;
    value: number;
};

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string" && message.trim() !== "") {
            return message;
        }
    }

    return "Không thể tải dữ liệu tổng quan.";
}

export default function AdminDashboardPage() {
    const [dashboard, setDashboard] = useState<SystemDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadSystemDashboard() {
            try {
                const response = await getSystemDashboardApi();
                setDashboard(response.data);
            } catch (error: unknown) {
                setDashboard(null);
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }

        //Trang chỉ tải lại khi Admin truy cập lại màn hình tổng quan
        void loadSystemDashboard();
    }, []);

    const summaryItems: SummaryItem[] = dashboard
        ? [
            {
                label: "Tổng người dùng",
                value: dashboard.total_users,
            },
            {
                label: "Tổng thiết bị",
                value: dashboard.total_devices,
            },
            {
                label: "Bộ đo đang kích hoạt",
                value: dashboard.active_iot_devices,
            },
            {
                label: "Cảnh báo hôm nay",
                value: dashboard.today_alerts,
            },
        ]
        : [];

    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Tổng quan hệ thống
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Các số liệu chính của hệ thống tại thời điểm hiện tại.
                </p>
            </header>

            {errorMessage && (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            {loading ? (
                <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                    <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
                </section>
            ) : dashboard ? (
                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryItems.map((item) => (
                        <article key={item.label}
                            className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-600">{item.label}</p>
                            <p className="mt-3 text-3xl font-semibold text-emerald-700">
                                {item.value.toLocaleString("vi-VN")}
                            </p>
                        </article>
                    ))}
                </section>
            ) : null}
        </AdminLayout>
    );
}
