import { useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminUserDetailPage() {
    const { id } = useParams();

    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Chi tiết người dùng
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Mã người dùng: {id ?? "Không xác định"}
                </p>
            </header>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                    ##Thông tin thiết bị, dữ liệu điện năng và cảnh báo
                    của người dùng sẽ được xây dựng trong Giai đoạn 2.
                </p>
            </section>
        </AdminLayout>
    );
}