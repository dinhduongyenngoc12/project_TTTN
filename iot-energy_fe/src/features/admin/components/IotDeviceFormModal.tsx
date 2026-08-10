import { useEffect, useState } from "react";

type IotDeviceFormModalProps = {
    isOpen: boolean;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (apiKey: string) => Promise<void>;
};

export default function IotDeviceFormModal({
    isOpen,
    submitting,
    onClose,
    onSubmit,
}: IotDeviceFormModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [error, setError] = useState("");

    
    //Mỗi khi modal được mở, form sẽ được đưa về trạng thái ban đầu -> tránh giữ lại API Key đã nhập ở lần mở trước.
    
    useEffect(() => {
        if (isOpen) {
            setApiKey("");
            setError("");
        }
    }, [isOpen]);

    //Không render component khi modal đang đóng
    if (!isOpen) {
        return null;
    }

    async function handleSubmit() {
        const normalizedApiKey = apiKey.trim();

        //Kiểm tra cơ bản tại frontend trước khi gửi request
        if (normalizedApiKey === "") {
            setError("Vui lòng nhập tên định danh IOT Key của bộ đo IoT.");
            return;
        }

        setError("");

        
        //Việc gọi API được giao cho component cha.
        //Modal chỉ trả về API Key đã được loại bỏ khoảng trắng.

        await onSubmit(normalizedApiKey);
    }

    function handleClose() {
        //Không cho đóng modal trong khi request đang được xử lý
        if (submitting) {
            return;
        }

        setApiKey("");
        setError("");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit();
                }}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Thêm bộ đo IoT
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Nhập API Key đã được gán sẵn cho bộ đo vật lý.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="mt-6">
                    <label
                        htmlFor="iot-iot-key"
                        className="block text-sm font-medium text-slate-700"
                    >
                        API Key
                    </label>

                    <input
                        id="iot-iot-key"
                        type="text"
                        value={apiKey}
                        onChange={(event) => {
                            setApiKey(event.target.value);

                            //Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
                            if (error) {
                                setError("");
                            }
                        }}
                        disabled={submitting}
                        autoFocus
                        placeholder="Ví dụ: IOT_0101"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 disabled:bg-slate-100"
                    />

                    {error && (
                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Đang lưu..." : "Lưu bộ đo"}
                    </button>
                </div>
            </form>
        </div>
    );
}