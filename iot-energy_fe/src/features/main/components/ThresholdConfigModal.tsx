import { useEffect, useMemo, useState } from "react";
import type {
    AlertConfigItem,
    AlertMode,
} from "../../../api/alertConfigApi";

type Props = {
    isOpen: boolean;
    config: AlertConfigItem | null;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (data: {
        mode: AlertMode;
        power_threshold?: number | null;
    }) => void;
};

function toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
}

export default function ThresholdConfigModal({
    isOpen,
    config,
    submitting,
    onClose,
    onSubmit,
}: Props) {
    const [mode, setMode] = useState<AlertMode>("auto");
    const [powerThreshold, setPowerThreshold] = useState("");

    useEffect(() => {
        if (!config) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode(config.mode);
        setPowerThreshold(
            config.power_threshold === null || config.power_threshold === undefined
                ? ""
                : String(config.power_threshold),
        );
    }, [config]);

    const defaultThreshold = toNumber(config?.default_threshold);
    const manualThreshold = toNumber(powerThreshold);

    const recommendedRange = useMemo(() => {
        if (defaultThreshold === null) {
            return null;
        }

        return {
            min: Math.round(defaultThreshold * 0.7 * 100) / 100,
            max: Math.round(defaultThreshold * 1.3 * 100) / 100,
        };
    }, [defaultThreshold]);

    const isOutsideRecommendedRange =
        mode === "manual" &&
        recommendedRange !== null &&
        manualThreshold !== null &&
        (manualThreshold < recommendedRange.min ||
            manualThreshold > recommendedRange.max);

    if (!isOpen || !config) {
        return null;
    }

    function handleSubmit() {
        if (mode === "manual") {
            if (manualThreshold === null || manualThreshold <= 0) {
                alert("Vui lòng nhập ngưỡng cảnh báo hợp lệ.");
                return;
            }

            /*
             * Người dùng vẫn được phép lưu ngoài khoảng khuyến nghị,
             * nhưng cần xác nhận để tránh nhập nhầm giá trị quá cao hoặc quá thấp.
             */
            if (isOutsideRecommendedRange) {
                const confirmed = window.confirm(
                    "Ngưỡng bạn nhập nằm ngoài khoảng khuyến nghị. Bạn vẫn muốn lưu cấu hình này?",
                );

                if (!confirmed) {
                    return;
                }
            }

            onSubmit({
                mode: "manual",
                power_threshold: manualThreshold,
            });

            return;
        }

        onSubmit({
            mode: "auto",
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Cấu hình ngưỡng cảnh báo
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Thiết bị:{" "}
                            <span className="font-semibold text-slate-800">
                                {config.device?.name ?? "Không xác định"}
                            </span>
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
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p>
                            Ngưỡng mặc định:{" "}
                            <span className="font-semibold text-slate-900">
                                {defaultThreshold === null ? "--" : defaultThreshold + " W"}
                            </span>
                        </p>

                        {recommendedRange && (
                            <p className="mt-2">
                                Khoảng khuyến nghị:{" "}
                                <span className="font-semibold text-slate-900">
                                    {recommendedRange.min} W - {recommendedRange.max} W
                                </span>
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Chế độ ngưỡng
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                                <input
                                    type="radio"
                                    checked={mode === "auto"}
                                    onChange={() => setMode("auto")}
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                    Tự động
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                                <input
                                    type="radio"
                                    checked={mode === "manual"}
                                    onChange={() => setMode("manual")}
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                    Thủ công
                                </span>
                            </label>
                        </div>
                    </div>

                    {mode === "manual" && (
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Ngưỡng cảnh báo thủ công
                            </span>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={powerThreshold}
                                onChange={(event) =>
                                    setPowerThreshold(event.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                                placeholder="Ví dụ: 750"
                            />

                            {isOutsideRecommendedRange && (
                                <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                    Giá trị này nằm ngoài khoảng khuyến nghị.
                                    Khi lưu, hệ thống sẽ yêu cầu xác nhận.
                                </p>
                            )}
                        </label>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Đang lưu..." : "Lưu cấu hình"}
                    </button>
                </div>
            </div>
        </div>
    );
}
