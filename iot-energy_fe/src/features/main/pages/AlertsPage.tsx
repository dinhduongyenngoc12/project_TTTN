import UserLayout from "../../../layouts/UserLayout";

export default function AlertsPage() {
    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Cảnh báo
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Cảnh báo vượt ngưỡng
                </h1>
            </header>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                <p className="text-sm text-slate-600">
                    Khu vực theo dõi các thiết bị đang vượt ngưỡng tiêu thụ đã cài đặt.
                </p>
            </section>
        </UserLayout>
    );
}
