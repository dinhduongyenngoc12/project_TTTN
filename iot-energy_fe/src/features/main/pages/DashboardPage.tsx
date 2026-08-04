import { NavLink } from "react-router-dom";
import UserLayout from "../../../layouts/UserLayout";
import { useDashboard } from "../hooks/useDashboard";

const quickLinks = [
    {
        label: "Quản lý thiết bị",
        description: "Thêm thiết bị, xem chi tiết và cập nhật các thiết bị đang theo dõi.",
        path: "/devices",
    },
    {
        label: "Xem thống kê",
        description: "Theo dõi dữ liệu điện năng thống kê theo giờ, ngày và tháng.",
        path: "/statistics",
    },
    {
        label: "Xem cảnh báo",
        description: "Kiểm tra các lần thiết bị vượt ngưỡng.",
        path: "/alerts",
    },
];

function formatEnergy(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(value) + " kWh";
}

function formatPower(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2,
    }).format(value) + " W";
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("vi-VN");
}

function getTrendText(
    trend: "increase" | "decrease" | "stable",
): string {
    if (trend === "increase") {
        return "Tăng";
    }

    if (trend === "decrease") {
        return "Giảm";
    }

    return "Không đổi";
}

function getTrendTextClass(
    trend: "increase" | "decrease" | "stable",
): string {
    if (trend === "increase") {
        return "text-rose-600";
    }

    if (trend === "decrease") {
        return "text-emerald-600";
    }

    return "text-slate-600";
}

export default function DashboardPage() {
    const { data, isLoading, isError } = useDashboard();
    const dashboard = data?.data;

    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Trang chủ
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Tổng quan hệ thống
                </h1>
            </header>

            {isLoading && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500">
                    Đang tải dữ liệu...
                </section>
            )}

            {isError && (
                <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
                    Không thể tải dữ liệu trang chủ. Vui lòng thử lại.
                </section>
            )}

            {!isLoading && !isError && dashboard && (
                <>
                    <section className="mt-6 grid gap-6 lg:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-white p-6">
                            <p className="text-sm font-medium text-slate-500">
                                Người dùng
                            </p>

                            <h2 className="mt-3 text-xl font-semibold text-slate-900">
                                {dashboard.user.username}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {dashboard.user.email}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-6">
                            <p className="text-sm font-medium text-slate-500">
                                Tổng thiết bị
                            </p>

                            <p className="mt-3 text-3xl font-semibold text-slate-900">
                                {dashboard.device_count}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-6">
                            <p className="text-sm font-medium text-slate-500">
                                Điện năng hôm nay
                            </p>

                            <p className="mt-3 text-3xl font-semibold text-slate-900">
                                {formatEnergy(
                                    dashboard.energy_trend.today_energy,
                                )}
                            </p>
                        </article>
                    </section>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            So sánh điện năng
                        </h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Hôm nay
                                </p>
                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {formatEnergy(
                                        dashboard.energy_trend.today_energy,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Hôm qua
                                </p>
                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {formatEnergy(
                                        dashboard.energy_trend.yesterday_energy,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Chênh lệch
                                </p>

                                <p className="mt-2 text-xl font-semibold">
                                    <span
                                        className={getTrendTextClass(
                                            dashboard.energy_trend.trend,
                                        )}
                                    >
                                        {getTrendText(
                                            dashboard.energy_trend.trend,
                                        )}

                                        {dashboard.energy_trend.percentage !== null && (
                                            <>
                                                {" "}
                                                {Math.abs(
                                                    dashboard.energy_trend.percentage,
                                                ).toFixed(2)}
                                                %
                                            </>
                                        )}
                                    </span>
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {formatEnergy(
                                        Math.abs(
                                            dashboard.energy_trend.difference,
                                        ),
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Cảnh báo gần đây
                            </h2>

                            <NavLink
                                to="/alerts"
                                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                            >
                                Xem tất cả
                            </NavLink>
                        </div>

                        {dashboard.recent_alerts.length === 0 ? (
                            <p className="mt-5 text-sm text-slate-500">
                                Chưa có cảnh báo nào.
                            </p>
                        ) : (
                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="border-b border-slate-200 text-slate-500">
                                        <tr>
                                            <th className="px-3 py-3 font-medium">
                                                Thiết bị
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Công suất
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Ngưỡng
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Thời gian
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard.recent_alerts.map(
                                            (alert) => (
                                                <tr
                                                    key={alert.id}
                                                    className="border-b border-slate-100 last:border-0"
                                                >
                                                    <td className="px-3 py-4 font-medium text-slate-900">
                                                        {alert.device_name}
                                                    </td>
                                                    <td className="px-3 py-4 text-rose-600">
                                                        {formatPower(
                                                            alert.power_value,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 text-slate-600">
                                                        {formatPower(
                                                            alert.threshold_value,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 text-slate-600">
                                                        {formatDateTime(
                                                            alert.created_at,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-3">
                        {quickLinks.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                            >
                                <h2 className="font-semibold text-slate-900">
                                    {item.label}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {item.description}
                                </p>
                            </NavLink>
                        ))}
                    </section>
                </>
            )}

            {!isLoading && !isError && !dashboard && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500">
                    Chưa có dữ liệu để hiển thị.
                </section>
            )}
        </UserLayout>
    );
}