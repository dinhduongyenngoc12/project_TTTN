import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLogoutForm } from "../../auth/hooks/useAuthForm";
import { useAuthLoginStore } from "../../../app/store/useAuthStore";
import {
    getDevicesApi,
    getEnergyLogsApi,
    getMeApi,
    getThresholdsApi,
    type UserProfile,
} from "../../services/HomeService";
import {
    buildDashboardDevices,
    buildDashboardSummary,
    type DashboardSummary,
} from "../utils/homeDashboard";

const menuItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Thiết bị", path: "/devices" },
    { label: "Lịch sử điện năng", path: "/energy-history" },
    { label: "Cảnh báo", path: "/alerts" },
    { label: "Cài đặt Ngưỡng", path: "/threshold-settings" },
];

const emptySummary: DashboardSummary = {
    totalPower: 0,
    activeDevices: 0,
    overThresholdDevices: 0,
    totalDevices: 0,
};

function getMenuItemClass(isActive: boolean) {
    const commonClass = "min-w-fit rounded-2xl px-4 py-3";
    const selectedClass = "bg-emerald-500 text-white";
    const normalClass = "bg-slate-50 text-slate-600";

    if (isActive) {
        return commonClass + " " + selectedClass;
    }
    return commonClass + " " + normalClass;
}

export default function HomePage() {
    const { handleLogout } = useLogoutForm();
    const { username, email } = useAuthLoginStore();
    const [user, setUser] = useState<UserProfile | null>(null);         
    const [summary, setSummary] = useState<DashboardSummary>(emptySummary);

    useEffect(() => {
        let isMounted = true;                //bien bao ve cho async (trang da roi di, api tra ve muon, co setState)

        const fetchHomeData = async () => {
            try {
                const [meData, devicesData, energyLogsData, thresholdsData] = await Promise.all([
                    getMeApi(),
                    getDevicesApi(),
                    getEnergyLogsApi(),
                    getThresholdsApi(),
                ]);

                if (!isMounted) {
                    return;
                }

                const dashboardDevices = buildDashboardDevices(
                    devicesData.devices ?? [],
                    energyLogsData.energyLogs ?? [],
                    thresholdsData.thresholds ?? [],
                );

                setUser(meData.user ?? null);
                setSummary(buildDashboardSummary(dashboardDevices));
            } catch {
                if (!isMounted) {
                    return;
                }

                setUser(null);
                setSummary(emptySummary);
            }
        };

        fetchHomeData();

        return () => {
            isMounted = false;
        };
    }, []);

    const displayName = user?.username || username || "User";
    const displayEmail = user?.email || email || "No email";

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(135deg,_#f5fff9_0%,_#ecfdf5_42%,_#f8fafc_100%)] text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
                <aside className="rounded-[28px] border border-emerald-100 bg-white/85 p-5 shadow-xl shadow-emerald-100/60 backdrop-blur lg:w-72">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-white">
                            IE
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                                User Portal
                            </p>
                            <h1 className="mt-1 text-xl font-bold text-slate-900">
                                IoT Energy
                            </h1>
                        </div>
                    </div>

                    <nav className="mt-6 flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => getMenuItemClass(isActive)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Dashboard</p>
                        <p className="mt-2 leading-6">
                            Đang dùng dữ liệu Thiết bị, Nhật ký năng lượng và Ngưỡng tiêu thụ hiện có để tổng hợp cảnh báo
                        </p>
                    </div>

                    <nav className="mt-6 flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center rounded-2xl border border-red-300/30 bg-white/10 px-4 py-3 text-sm font-semibold text-red transition hover:bg-red-500/90"
                        >
                            Đăng xuất
                        </button>
                    </nav>
                </aside>

                <main className="flex-1">
                    <header className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10 sm:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300">
                                    Trang chủ
                                </p>
                                <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                                    Theo dõi Điện năng tiêu thụ
                                </h2>
                            </div>
                        </div>
                    </header>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <article className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-100/60 backdrop-blur">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                                Người dùng:
                            </p>
                            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {displayName}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-[28px] border border-sky-100 bg-white/90 p-6 shadow-xl shadow-sky-100/60 backdrop-blur">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                                Trạng thái hệ thống
                            </p>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-500">Tổng thiết bị</p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {summary.totalDevices}
                                    </p>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-500">Cảnh báo đang mở</p>
                                    <p className="mt-2 text-3xl font-bold text-rose-600">
                                        {summary.overThresholdDevices}
                                    </p>
                                </div>
                            </div>
                        </article>
                    </section>

                    {summary.overThresholdDevices > 0 && (
                        <section className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900 shadow-lg shadow-rose-100/70">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em]">
                                Cảnh báo
                            </p>
                            <p className="mt-2 text-base font-medium">
                                Có {summary.overThresholdDevices} thiết bị đang vượt ngưỡng tiêu thụ cài đặt
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
