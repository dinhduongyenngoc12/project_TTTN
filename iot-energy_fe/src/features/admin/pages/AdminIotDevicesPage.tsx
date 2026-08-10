import axios from "axios";
import { useEffect, useState } from "react";

import {
    createIotDeviceApi,
    disableIotDeviceApi,
    enableIotDeviceApi,
    getIotDevicesApi,
    type IotDeviceItem,
    type IotDeviceStatus,
} from "../../../api/iotDeviceApi";
import AdminLayout from "../../../layouts/AdminLayout";
import IotDeviceFormModal from "../components/IotDeviceFormModal";
import {
    formatDateTime,
    getConnectionStatusLabel,
    getIotDeviceStatusLabel,
    getLinkedDeviceLabel,
} from "../utils/iotDeviceUtils";

type StatusFilter = IotDeviceStatus | "";

type Feedback = {
    type: "success" | "error";
    message: string;
};

export default function AdminIotDevicesPage() {
    //Danh sách bộ đo IoT lấy từ backend
    const [iotDevices, setIotDevices] = useState<IotDeviceItem[]>([]);

    //Dữ liệu tìm kiếm và lọc
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("");

    //Trạng thái xử lý giao diện
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    //Thông báo kết quả thao tác
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    //Lấy thông báo lỗi từ response của backend
    function getErrorMessage(
        error: unknown,
        defaultMessage: string,
    ): string {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message;

            if (typeof message === "string" && message.trim() !== "") {
                return message;
            }
        }

        return defaultMessage;
    }

    //Nạp danh sách bộ đo theo từ khóa và trạng thái đang chọn
    async function loadIotDevices(
        searchKeyword = keyword,
        searchStatus = statusFilter,
    ) {
        setLoading(true);

        try {
            const response = await getIotDevicesApi({
                keyword: searchKeyword.trim(),
                status: searchStatus,
            });

            setIotDevices(response.iotDevices ?? []);
        } catch (error: unknown) {
            setIotDevices([]);

            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể tải danh sách bộ đo IoT.",
                ),
            });
        } finally {
            setLoading(false);
        }
    }

    //Xử lý tìm kiếm khi admin gửi form bộ lọc
    async function handleSearch() {
        setFeedback(null);
        await loadIotDevices(keyword, statusFilter);
    }

    //Thêm bộ đo mới bằng API Key do admin nhập
    async function handleCreate(apiKey: string) {
        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await createIotDeviceApi({
                iot_key: apiKey,
            });

            setFeedback({
                type: "success",
                message: response.message,
            });

            setOpenModal(false);

            //Tải lại danh sách để nhận dữ liệu chính xác từ backend
            await loadIotDevices();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể thêm bộ đo IoT.",
                ),
            });
        } finally {
            setSubmitting(false);
        }
    }

    //Vô hiệu hóa bộ đo và ngừng theo dõi các thiết bị đang active
    async function handleDisable(iotDevice: IotDeviceItem) {
        const confirmed = window.confirm(
            `Bạn có chắc muốn vô hiệu hóa bộ đo ${iotDevice.iot_key}?`,
        );

        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await disableIotDeviceApi(
                iotDevice.id,
            );

            setFeedback({
                type: "success",
                message: response.message,
            });

            await loadIotDevices();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể vô hiệu hóa bộ đo IoT.",
                ),
            });
        } finally {
            setSubmitting(false);
        }
    }

    //Kích hoạt lại quyền sử dụng bộ đo
    async function handleEnable(iotDevice: IotDeviceItem) {
        const confirmed = window.confirm(
            `Bạn có chắc muốn kích hoạt lại bộ đo ${iotDevice.iot_key}?`,
        );

        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await enableIotDeviceApi(
                iotDevice.id,
            );

            setFeedback({
                type: "success",
                message: response.message,
            });

            
            //Thiết bị gia dụng cũ vẫn giữ trạng thái inactive
            //Người dùng phải khai báo lại thiết bị nếu muốn tiếp tục đo
            
            await loadIotDevices();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể kích hoạt lại bộ đo IoT.",
                ),
            });
        } finally {
            setSubmitting(false);
        }
    }

    function openCreateModal() {
        setFeedback(null);
        setOpenModal(true);
    }

    function closeModal() {
        if (submitting) {
            return;
        }

        setOpenModal(false);
    }

    //Nạp danh sách bộ đo khi trang được mở lần đầu
    useEffect(() => {
        void loadIotDevices("", "");
    }, []);

    return (
        <AdminLayout>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Bộ đo IoT
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Quản lý trạng thái cấp phép và theo dõi kết nối
                        của các bộ đo IoT.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    Thêm bộ đo
                </button>
            </header>

            {feedback && (
                <div
                    className={
                        "mt-5 rounded-lg border px-4 py-3 text-sm " +
                        (feedback.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700")
                    }
                >
                    {feedback.message}
                </div>
            )}

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSearch();
                    }}
                    className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
                >
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Tìm theo API Key
                        </span>

                        <input
                            type="text"
                            value={keyword}
                            onChange={(event) =>
                                setKeyword(event.target.value)
                            }
                            placeholder="Ví dụ: IOT_0001"
                            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Trạng thái
                        </span>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as StatusFilter,
                                )
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="active">
                                Đang cấp phép
                            </option>
                            <option value="disabled">
                                Đã vô hiệu hóa
                            </option>
                        </select>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        >
                            {loading ? "Đang tải..." : "Tìm kiếm"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {loading ? (
                    <p className="p-6 text-sm text-slate-500">
                        Đang tải danh sách bộ đo IoT...
                    </p>
                ) : iotDevices.length === 0 ? (
                    <p className="p-6 text-sm text-slate-500">
                        Không tìm thấy bộ đo IoT phù hợp.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        API Key
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Trạng thái
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Kết nối
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Thiết bị đang theo dõi
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Ngày tạo
                                    </th>

                                    <th className="px-5 py-3 text-right font-semibold">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {iotDevices.map((iotDevice) => (
                                    <tr
                                        key={iotDevice.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {iotDevice.iot_key}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={
                                                    "inline-flex rounded-full px-3 py-1 text-xs font-medium " +
                                                    (iotDevice.status ===
                                                    "active"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700")
                                                }
                                            >
                                                {getIotDeviceStatusLabel(
                                                    iotDevice.status,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={
                                                    "inline-flex rounded-full px-3 py-1 text-xs font-medium " +
                                                    (iotDevice.connection_status ===
                                                    "online"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600")
                                                }
                                            >
                                                {getConnectionStatusLabel(
                                                    iotDevice.connection_status,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-slate-700">
                                            {getLinkedDeviceLabel(
                                                iotDevice.linked_device
                                                    ?.name,
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDateTime(
                                                iotDevice.created_at,
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            {iotDevice.status ===
                                            "active" ? (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        submitting
                                                    }
                                                    onClick={() =>
                                                        void handleDisable(
                                                            iotDevice,
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Vô hiệu hóa
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        submitting
                                                    }
                                                    onClick={() =>
                                                        void handleEnable(
                                                            iotDevice,
                                                        )
                                                    }
                                                    className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Kích hoạt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <IotDeviceFormModal
                isOpen={openModal}
                submitting={submitting}
                onClose={closeModal}
                onSubmit={handleCreate}
            />
        </AdminLayout>
    );
}