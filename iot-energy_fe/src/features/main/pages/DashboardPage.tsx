import { useEffect, useState } from "react";
import { useAuthLoginStore } from "../../../app/store/useAuthStore";
import UserLayout from "../../../layouts/UserLayout";
import {
    getAlertConfigsApi,
    getEnergyLogsApi,
    getMeApi,
    type UserProfile,
} from "../../services/HomeService";
import {
    buildDashboardDevices,
    buildDashboardSummary,
    buildUserDashboardData,
    type DashboardSummary,
} from "../utils/dashboardUtils";
import { getDevicesApi } from "../../../api/deviceApi";

const emptySummary: DashboardSummary = {
    totalPower: 0,
    activeDevices: 0,
    overThresholdDevices: 0,
    totalDevices: 0,
};

export default function DashboardPage() {
    const { username, email } = useAuthLoginStore();
    //luu user lay tu API /api/auth/me.
    const [user, setUser] = useState<UserProfile | null>(null);
    //luu du lieu tong quan he thong
    const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
    //loading lan dau
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchDashboardData(showLoading = false) {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            try {
                //Promise.all goi nhieu api 1 luc
                const [meData, devicesData, energyLogsData, alertConfigsData] =
                    await Promise.all([
                        getMeApi(),
                        getDevicesApi(),
                        getEnergyLogsApi(),
                        getAlertConfigsApi(),
                    ]);

                //user da roi khoi trang thi khong setState nua
                if (!isMounted) {
                    return;
                }

                //user hien tai
                const dashboardData = buildUserDashboardData({
                    userId: meData.user?.id,
                    devices: devicesData.devices ?? [],
                    energyLogs: energyLogsData.energyLogs ?? [],
                    alertConfigs:
                        alertConfigsData.alertConfigs ??
                        alertConfigsData.thresholds ??
                        [],
                });

                //devices + energyLogs + alertConfigs
                const dashboardDevices = buildDashboardDevices(
                    dashboardData.devices,
                    dashboardData.energyLogs,
                    dashboardData.alertConfigs,
                );

                setUser(meData.user ?? null);
                setSummary(buildDashboardSummary(dashboardDevices));
            } catch {
                if (!isMounted) {
                    return;
                }

                setUser(null);
                setSummary(emptySummary);
                setError("Không thể tải dữ liệu trang chủ. Vui lòng thử lại.");
            } finally {
                if (isMounted && showLoading) {
                    setLoading(false);
                }
            }
        }

        //vao trag lan dau co loading
        void fetchDashboardData(true);

        //trang realtime, lan refresh sau thi chay ngam, khong loading
        const intervalId = window.setInterval(() => {
            void fetchDashboardData(false);
        }, 10000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const displayName = user?.username || username || "User";
    const displayEmail = user?.email || email || "No email";

    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Trang chủ
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Theo dõi điện năng tiêu thụ
                </h1>
            </header>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-100/60 backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                        Người dùng
                    </p>

                    <div className="mt-5">
                        <h3 className="text-2xl font-bold text-slate-900">
                            {displayName}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {displayEmail}
                        </p>
                    </div>
                </article>

                <article className="rounded-[28px] border border-sky-100 bg-white/90 p-6 shadow-xl shadow-sky-100/60 backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                        Trạng thái hệ thống
                    </p>

                    {loading ? (
                        <p className="mt-5 text-sm text-slate-500">
                            Đang tải dữ liệu...
                        </p>
                    ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Tổng thiết bị
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {summary.totalDevices}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Công suất hiện tại
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {Math.round(summary.totalPower)} W
                                </p>
                            </div>

                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Cảnh báo đang mở
                                </p>
                                <p className="mt-2 text-3xl font-bold text-rose-600">
                                    {summary.overThresholdDevices}
                                </p>
                            </div>
                        </div>
                    )}
                </article>
            </section>

            {error && (
                <section className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
                    {error}
                </section>
            )}

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
        </UserLayout>
    );
}