import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminIotDevicesPage() {
    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Bộ đo IoT
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Theo dõi tình trạng kết nối và khả năng hoạt động
                    của các bộ đo IoT.
                </p>
            </header>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                    ##Danh sách bộ đo và chức năng disable sẽ được xây
                    dựng trong Giai đoạn 3.
                </p>
            </section>
        </AdminLayout>
    );
}