import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getAdminUsersApi,
    type AdminUserItem,
} from "../../../api/adminUserApi";
import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const response = await getAdminUsersApi();
                setUsers(response.users ?? []);
            } catch (error: unknown) {
                setUsers([]);

                if (axios.isAxiosError(error) &&
                    typeof error.response?.data?.message === "string") {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("Không thể tải danh sách người dùng.");
                }
            } finally {
                setLoading(false);
            }
        }

        void loadUsers();
    }, []);

    return (
        <AdminLayout>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Quản lý người dùng
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Xem tài khoản và số thiết bị của từng người dùng.
                </p>
            </header>

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {errorMessage && (
                    <p className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </p>
                )}

                {loading ? (
                    <p className="p-6 text-sm text-slate-600">Đang tải dữ liệu...</p>
                ) : users.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                        Chưa có người dùng.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-3 font-medium">ID</th>
                                    <th className="px-5 py-3 font-medium">Tên người dùng</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Thiết bị</th>
                                    <th className="px-5 py-3 text-right font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-5 py-4 text-slate-500">{user.id}</td>
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {user.username}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {Number(user.device_count)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link to={"/admin/users/" + user.id}
                                                className="font-medium text-emerald-700 hover:text-emerald-800">
                                                Xem
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
