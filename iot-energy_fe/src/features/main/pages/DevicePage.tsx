import { useEffect, useState } from "react";
import {
    getDevicesApi,
    getEnergyLogsApi,
    getThresholdsApi,
} from "../../services/HomeService";
import {
    buildDashboardDevices,
    formatDateTime,
    formatPower,
    type DashboardDevice,
} from "../utils/homeDashboard";
import { NavLink } from "react-router-dom";
import { useLogoutForm } from "../../auth/hooks/useAuthForm";

const menuItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Thiết bị", path: "/devices" },
    { label: "Lịch sử điện năng", path: "/energy-history" },
    { label: "Cảnh báo", path: "/alerts" },
    { label: "Cài đặt Ngưỡng", path: "/threshold-settings" },
];

function getMenuItemClass(isActive: boolean) {
    const commonClass = "min-w-fit rounded-2xl px-4 py-3";
    const selectedClass = "bg-emerald-500 text-white";
    const normalClass = "bg-slate-50 text-slate-600";

    if (isActive) {
        return commonClass + " " + selectedClass;
    }

    return commonClass + " " + normalClass;
}

export default function DevicePage() {
    const { handleLogout } = useLogoutForm();
    const [devices, setDevices] = useState<DashboardDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchDeviceData = async () => {
            setLoading(true);
            setError("");

            try {
                const [devicesData, energyLogsData, thresholdsData] = await Promise.all([
                    getDevicesApi(),
                    getEnergyLogsApi(),
                    getThresholdsApi(),
                ]);

                if (!isMounted) return;

                const dashboardDevices = buildDashboardDevices(
                    devicesData.devices ?? [],
                    energyLogsData.energyLogs ?? [],
                    thresholdsData.thresholds ?? [],
                );

                setDevices(dashboardDevices);
            } catch (err) {
                if (!isMounted) return;

                setError("Không thể tải danh sách thiết bị. Vui lòng thử lại!");
                setDevices([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDeviceData();

        return () => {
            isMounted = false;
        };
    }, []);

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

                       <nav className="mt-6 flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center rounded-2xl border border-red-300/30 bg-white/10 px-4 py-3 text-sm font-semibold text-red transition hover:bg-red-500/90">
                            Đăng xuất
                        </button>
                    </nav>
                </aside>

                <div className="space-y-6">
                    <header className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10 sm:px-8">
                        <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300">
                            Thiết bị
                        </p>
                        <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                            Danh sách thiết bị của người dùng
                        </h2>
                    </header>

                    <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                        {loading ? (
                            <p className="text-sm text-slate-500">Đang tải dữ liệu thiết bị...</p>
                        ) : error ? (
                            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </p>
                        ) : devices.length === 0 ? (
                            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                Chưa có thiết bị nào thuộc user của phiên này!
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {devices.map((device) => (
                                    <div
                                        key={device.id}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <h3 className="text-lg font-bold text-slate-900">{device.name}</h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Công suất hiện tại: {formatPower(device.latestPower)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Ngưỡng tối đa: {formatPower(device.maxPower)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Cập nhật lúc: {formatDateTime(device.lastUpdated)}
                                        </p>
                                        <p
                                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${device.isOverThreshold
                                                ? "bg-rose-100 text-rose-700"
                                                : "bg-emerald-100 text-emerald-700"
                                                }`}
                                        >
                                            {device.isOverThreshold ? "Vượt ngưỡng" : "Bình thường"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>


            </div>
        </div>

    );


}
