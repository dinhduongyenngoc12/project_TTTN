import type {DeviceItem, CreateDevicePayload} from "../../../api/deviceApi";
import { DEVICE_TYPES } from "../utils/deviceUtils";

type DeviceFormProps = {
    isOpen: boolean;
    editingDevice: DeviceItem | null;
    formData: CreateDevicePayload;
    submitting: boolean;
    onClose: () => void;
    onChange: (data: CreateDevicePayload) => void;
    onSubmit: () => void;
};

//Hiển thị modal nhập thông tin thiết bị và gửi dữ liệu về page thông qua onSubmit
export default function DeviceFormModal({
    isOpen,
    editingDevice,
    formData,
    submitting,
    onClose,
    onChange,
    onSubmit,
}: DeviceFormProps) {
    //Nếu modal chưa mở thì không render nội dung ra giao diện
    if (!isOpen) {
        return null;
    }

    const isEditing = editingDevice !== null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                }}
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {isEditing ? "Sửa thiết bị" : "Thêm thiết bị"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEditing
                                ? "Cập nhật thông tin thiết bị điện."
                                : "Nhập thông tin thiết bị điện và API Key của bộ đo IoT."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                    >
                        Đóng
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    {/* API Key chỉ sử dụng khi thêm mới thiết bị */}
                    {!isEditing && (
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                API Key của bộ đo IoT
                                <span className="ml-1 text-red-500">*</span>
                            </span>

                            <input
                                type="text"
                                required
                                value={formData.api_key}
                                onChange={(event) =>
                                    onChange({
                                        ...formData,
                                        api_key: event.target.value,
                                    })
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                                placeholder="Ví dụ: IOT_0001"
                                autoComplete="off"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                API Key là mã định danh được cấp kèm theo bộ đo
                                IoT và được sử dụng để liên kết bộ đo với thiết bị
                                gia dụng.
                            </p>
                        </label>
                    )}

                    <label className="block">
                        <span className="text-sm font-semibold text-slate-700">
                            Tên thiết bị
                            <span className="ml-1 text-red-500">*</span>
                        </span>

                        <input
                            type="text"
                            required
                            maxLength={100}
                            value={formData.name}
                            onChange={(event) =>
                                onChange({
                                    ...formData,
                                    name: event.target.value,
                                })
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                            placeholder="Ví dụ: Tủ lạnh Samsung"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-semibold text-slate-700">
                            Loại thiết bị
                            <span className="ml-1 text-red-500">*</span>
                        </span>

                        <select
                            required
                            value={formData.device_type}
                            onChange={(event) =>
                                onChange({
                                    ...formData,
                                    device_type: event.target.value,
                                })
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
                        >
                            <option value="" disabled>
                                Chọn loại thiết bị
                            </option>

                            {DEVICE_TYPES.map((deviceType) => (
                                <option key={deviceType} value={deviceType}>
                                    {deviceType}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-semibold text-slate-700">
                            Công suất định mức
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                Không bắt buộc
                            </span>
                        </span>

                        <div className="relative mt-2">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.rated_power ?? ""}
                                onChange={(event) =>
                                    onChange({
                                        ...formData,
                                        rated_power:
                                            event.target.value === ""
                                                ? null
                                                : Number(event.target.value),
                                    })
                                }
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-14 text-sm outline-none focus:border-emerald-400"
                                placeholder="Ví dụ: 150"
                            />

                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-400">
                                W
                            </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Có thể nhập công suất ghi trên nhãn hoặc tài liệu kỹ
                            thuật của thiết bị. Có thể để trống nếu không biết.
                        </p>
                    </label>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Đang lưu..."
                            : isEditing
                              ? "Cập nhật thiết bị"
                              : "Thêm thiết bị"}
                    </button>
                </div>
            </form>
        </div>
    );
}