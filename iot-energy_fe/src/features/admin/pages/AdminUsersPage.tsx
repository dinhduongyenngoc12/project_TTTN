import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminUsersPage() {
    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Người dùng
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Theo dõi tài khoản và dữ liệu thiết bị theo từng
                    người dùng.
                </p>
            </header>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                    ###Danh sách người dùng sẽ được xây dựng trong
                    Giai đoạn 2.
                </p>
            </section>
        </AdminLayout>
    );
}