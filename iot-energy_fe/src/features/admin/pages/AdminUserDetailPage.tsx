import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getAdminUserDetailApi,
    type AdminUserDetail,
} from "../../../api/adminUserApi";
import AdminLayout from "../../../layouts/AdminLayout";

function formatDateTime(value: string | null): string {
    if (!value) return "Chưa kích hoạt";

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function AdminUserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadUserDetail() {
            const userId = Number(id);

            if (!Number.isInteger(userId) || userId < 1) {
                setErrorMessage("Mã người dùng không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                const response = await getAdminUserDetailApi(userId);
                setUser(response.user);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) &&
                    typeof error.response?.data?.message === "string") {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("Không thể tải thông tin người dùng.");
                }
            } finally {
                setLoading(false);
            }
        }

        void loadUserDetail();
    }, [id]);

    return (
        <AdminLayout>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Chi tiết người dùng
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Thông tin tài khoản và các thiết bị đang quản lý.
                    </p>
                </div>
                <Link to="/admin/users"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Quay lại
                </Link>
            </header>

            {errorMessage && (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-slate-600">Đang tải dữ liệu...</p>
            ) : user ? (
                <>
                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold text-slate-900">Thông tin tài khoản</h2>
                        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                            <div>
                                <dt className="text-slate-500">Tên người dùng</dt>
                                <dd className="mt-1 font-medium text-slate-900">{user.username}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Email</dt>
                                <dd className="mt-1 font-medium text-slate-900">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Số thiết bị</dt>
                                <dd className="mt-1 font-medium text-slate-900">{user.devices.length}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">Thiết bị</h2>
                        </div>

                        {user.devices.length === 0 ? (
                            <p className="p-6 text-center text-sm text-slate-500">
                                Người dùng chưa có thiết bị.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Tên thiết bị</th>
                                            <th className="px-5 py-3 font-medium">Loại</th>
                                            <th className="px-5 py-3 font-medium">Công suất định mức</th>
                                            <th className="px-5 py-3 font-medium">Trạng thái</th>
                                            <th className="px-5 py-3 font-medium">Kích hoạt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.devices.map((device) => (
                                            <tr key={device.id} className="border-b border-slate-100 last:border-0">
                                                <td className="px-5 py-4 font-medium text-slate-900">{device.name}</td>
                                                <td className="px-5 py-4 text-slate-600">{device.device_type}</td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {device.rated_power ? device.rated_power + " W" : "Chưa có"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={device.status === "active"
                                                        ? "text-emerald-700"
                                                        : "text-slate-500"}>
                                                        {device.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {formatDateTime(device.activated_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            ) : null}
        </AdminLayout>
    );
}
