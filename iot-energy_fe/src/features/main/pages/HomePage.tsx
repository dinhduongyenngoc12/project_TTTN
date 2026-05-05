import { useEffect, useState } from "react";
import { useLogoutForm } from "../../auth/hooks/useAuthForm";
import { useAuthLoginStore } from "../../../app/store/useAuthStore";
import { getDevicesApi, type DeviceItem } from "../../services/HomeService";

export default function HomePage() {
    const { handleLogout } = useLogoutForm();
    const { username, email } = useAuthLoginStore();

    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await getDevicesApi();
                setDevices(data.devices ?? []);
            } catch (err) {
                setError("Khong tai duoc danh sach thiet bi");
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 text-gray-900">
            <div className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col px-4 py-6 sm:px-6 sm:py-8">
                <header className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
                            IoT Energy
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Home Dashboard
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 12H9m0 0 3-3m-3 3 3 3"
                            />
                        </svg>
                        Đăng xuất
                    </button>
                </header>

                <main className="py-10">
                    <div className="grid gap-6">
                        <section className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur">
                            <p className="text-sm font-medium text-emerald-600">Thông tin người dùng: </p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                {username || "User"}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                {email || "No email"}
                            </p>
                        </section>

                        <section className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur">
                            <p className="text-sm font-medium text-blue-600">Danh sách thiết bị: </p>

                            {loading ? (
                                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                            ) : error ? (
                                <p className="mt-4 text-red-500">{error}</p>
                            ) : devices.length === 0 ? (
                                <p className="mt-4 text-gray-500">Chưa có thiết bị nào !</p>
                            ) : (
                                <div className="mt-4 grid gap-4">
                                    {/* {devices.map((device) => (
                                        <div
                                            key={device.id ?? device.pk}
                                            className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
                                        >
                                            <p className="text-lg font-semibold text-gray-900">
                                                {device.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Owner: {device.username || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                User ID: {device.user_id ?? "N/A"}
                                            </p>
                                        </div>
                                    ))} */}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

            </div>
        </div>
    );
}
