import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createDeviceApi,
    getDevicesApi,
    updateDeviceApi,
    type CreateDevicePayload,
    type DeviceFormData,
    type DeviceItem,
    type UpdateDevicePayload,
} from "../../../api/deviceApi";
import { DEVICE_STATUS_LABELS, formatDeviceDateTime, formatRatedPower, getConnectionStatus } from "../utils/deviceUtils";
import DeviceFormModal from "../components/DeviceFormModal";
import UserLayout from "../../../layouts/UserLayout";

export default function DevicePage() {
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceItem | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<DeviceFormData>({
        iot_key: "",
        name: "",
        device_type: "Khác",
        rated_power: null,
    });

    const navigate = useNavigate();

    //Cac thong ke nho dau trang
    const totalDevices = devices.length;

    const activeDevices = devices.filter(
        (device) => device.status === "active",
    ).length;

    const onlineDevices = devices.filter(
        (device) =>
            getConnectionStatus(
                device.iot_last_seen_at,
                device.status,
            ) === "online",
    ).length;

    async function loadDevices() {        //GET /api/devices
        setLoading(true);
        setError("");

        try {
            const devicesData = await getDevicesApi();
            setDevices(devicesData.devices ?? []);
        } catch {
            setError("Hệ thống không thể tải danh sách thiết bị. Vui lòng thử lại.");
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }

    function openCreateForm() {
        setEditingDevice(null); //đang ở chế độ thêm mới

        //Reset đầy đủ dữ liệu form, bao gồm API Key
        setFormData({
            iot_key: "",
            name: "",
            device_type: "Khác",
            rated_power: null,
        });

        setError("");
        setIsFormOpen(true); //mở modal
    }

    function openEditForm(device: DeviceItem) {
        setEditingDevice(device);

        setFormData({
            //Không cập nhật API Key khi sửa thiết bị
            iot_key: "",
            name: device.name,
            device_type: device.device_type,
            rated_power: device.rated_power ?? null,
        });

        setError("");
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingDevice(null);
        setSubmitting(false);
    }

    async function handleSubmitDevice() {
        //API Key chỉ bắt buộc khi thêm mới thiết bị
        if (!editingDevice && !formData.iot_key.trim()) {
            setError("Vui lòng nhập tên định danh IOT Key của bộ đo IoT.");
            return;
        }

        if (!formData.name.trim()) {
            setError("Vui lòng nhập tên thiết bị.");
            return;
        }

        if (!formData.device_type.trim()) {
            setError("Vui lòng chọn loại thiết bị.");
            return;
        }

        if (
            formData.rated_power !== null &&
            Number(formData.rated_power) < 0
        ) {
            setError("Công suất định mức không được nhỏ hơn 0.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            //Chuẩn hóa công suất định mức về number hoặc null
            const ratedPower =
                formData.rated_power === null ||
                    formData.rated_power === undefined ||
                    Number.isNaN(Number(formData.rated_power))
                    ? null
                    : Number(formData.rated_power);

            if (editingDevice) {
                //Khi sửa không gửi API Key vì không cho đổi bộ đo IoT
                const updatePayload: UpdateDevicePayload = {
                    name: formData.name.trim(),
                    device_type: formData.device_type.trim(),
                    rated_power: ratedPower,
                };

                await updateDeviceApi(editingDevice.id, updatePayload);
            } else {
                //Khi thêm phải gửi API Key để backend tìm và liên kết bộ đo IoT
                const createPayload: CreateDevicePayload = {
                    iot_key: formData.iot_key.trim(),
                    name: formData.name.trim(),
                    device_type: formData.device_type.trim(),
                    rated_power: ratedPower,
                };

                await createDeviceApi(createPayload);
            }

            await loadDevices();
            closeForm();
        } catch (requestError: any) {
            const message =
                requestError?.response?.data?.message ??
                "Không thể lưu thiết bị. Vui lòng thử lại.";

            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        void loadDevices();
    }, []);

    //page -> modal -> api -> deviceApi -> helper -> deviceUtils
    return (
        <UserLayout>
            <header className="flex items-center justify-between rounded-2xl bg-slate-950 px-6 py-6 text-white">
                {/*trái */}
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                        Thiết bị
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Thiết bị của tôi
                    </h1>
                    <p className="mt-2 text-sm text-slate-300">
                        Quản lý các thiết bị điện đang được theo dõi trong hệ thống.
                    </p>
                </div>

                {/*phải */}
                <div>
                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                        Thêm thiết bị
                    </button>
                </div>
            </header>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
                    <p className="text-sm text-slate-500">Tổng thiết bị</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {totalDevices}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
                    <p className="text-sm text-slate-500">Đang hoạt động</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {activeDevices}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
                    <p className="text-sm text-slate-500">Đang online</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {onlineDevices}
                    </p>
                </div>
            </section>

            <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur">
                {loading ? (
                    <p className="text-sm text-slate-500">
                        Đang tải dữ liệu thiết bị...
                    </p>
                ) : error ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : devices.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Bạn chưa có thiết bị nào. Hãy thêm thiết bị để bắt đầu theo dõi.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {devices.map((device) => {
                            const connectionStatus = getConnectionStatus(
                                device.iot_last_seen_at,
                                device.status,
                            );
                            const isOnline = connectionStatus === "online";

                            return (
                                <article
                                    key={device.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 flex flex-col"
                                >
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-h-[72px]">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {device.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {device.device_type}
                                            </p>
                                        </div>

                                        <span
                                            className={
                                                "rounded-full px-3 py-1 text-xs font-semibold " +
                                                (isOnline
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200 text-slate-600")
                                            }
                                        >
                                            {isOnline ? "Online" : "Offline"}
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-2 text-sm text-slate-600">
                                        <p>
                                            Công suất định mức:{" "}
                                            <span className="font-semibold text-slate-800">
                                                {formatRatedPower(device.rated_power)}
                                            </span>
                                        </p>

                                        <p>
                                            Trạng thái:{" "}
                                            <span className="font-semibold text-slate-800">
                                                {DEVICE_STATUS_LABELS[device.status]}
                                            </span>
                                        </p>

                                        <p>
                                            Lần gửi cuối:{" "}
                                            <span className="font-semibold text-slate-800">
                                                {device.status === "active"
                                                    ? formatDeviceDateTime(device.iot_last_seen_at)
                                                    : "Không còn theo dõi"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="mt-auto flex gap-2 pt-5">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(device)}
                                            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/devices/" + device.id)}
                                            className="flex-1 rounded-2xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                                        >
                                            Chi tiết
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <DeviceFormModal
                isOpen={isFormOpen}
                editingDevice={editingDevice}
                formData={formData}
                submitting={submitting}
                onClose={closeForm}
                onChange={setFormData}
                onSubmit={handleSubmitDevice}
            />
        </UserLayout>
    );
}
