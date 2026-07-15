import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminMonitoringPage() {
    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Giám sát hệ thống
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Theo dõi dữ liệu điện năng và cảnh báo phát sinh
                    trên toàn hệ thống.
                </p>
            </header>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                    ##Dữ liệu đo và cảnh báo hệ thống sẽ được xây dựng
                    trong Giai đoạn 4.
                </p>
            </section>
        </AdminLayout>
    );
}