import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminDashboardPage() {
    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Tổng quan hệ thống
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Theo dõi tình trạng người dùng, thiết bị, bộ đo IoT
                    và các cảnh báo phát sinh trong hệ thống.
                </p>
            </header>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                    Dữ liệu tổng quan sẽ được bổ sung sau khi hoàn thành
                    các API quản trị người dùng, bộ đo và giám sát.
                </p>
            </section>
        </AdminLayout>
    );
}