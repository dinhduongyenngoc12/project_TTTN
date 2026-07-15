import UserLayout from "../../../layouts/UserLayout";
import HourPowerChart from "../../shared/components/chart/HourPowerChart";
import DayEnergyChart from "../../shared/components/chart/DayEnergyChart";
import MonthEnergyChart from "../../shared/components/chart/MonthEnergyChart";

export default function StatisticsPage() {
    return (
        <UserLayout>
            <header className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10 sm:px-8">
                <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300">
                    Thống kê
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                    Thống kê điện năng tiêu thụ
                </h2>
            </header>
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <a
                        href="#hour"
                        className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                    >
                        Thống kê theo giờ
                    </a>

                    <a
                        href="#day"
                        className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                    >
                        Thống kê theo ngày
                    </a>

                    <a
                        href="#month"
                        className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                    >
                        Thống kê theo tháng
                    </a>
                </div>
            </section>
            <section id="hour" className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    CÔNG SUẤT TRUNG BÌNH THEO GIỜ
                </h3>

                <HourPowerChart />
                
            </section>

            <section id="day" className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    ĐIỆN NĂNG TIÊU THỤ THEO NGÀY
                </h3>

                <DayEnergyChart />

            </section>

            <section id="month" className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    ĐIỆN NĂNG TIÊU THỤ THEO THÁNG
                </h3>

                <MonthEnergyChart />

            </section>
        </UserLayout>
    );
}
