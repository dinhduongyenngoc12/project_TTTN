import axios from "axios";
import { useEffect, useState } from "react";

import {
    estimateElectricityCostApi,
    type ElectricityCostEstimate,
} from "../../../api/utilityApi";

import {
    createUtilityNoteApi, deleteUtilityNoteApi, getUtilityNotesApi, updateUtilityNoteApi, type UtilityNote,
} from "../../../api/utilityNoteApi";

import UserLayout from "../../../layouts/UserLayout";
import {formatCurrency, formatElectricityPrice, formatEnergy, formatTierRange, formatUtilityDate, formatUtilityDateTime, getCurrentMonthValue, VAT_OPTIONS, type VatRate,
} from "../utils/utilityUtils";

type Feedback = {
    type: "success" | "error";
    message: string;
};

export default function UtilitiesPage() {
    //Ước tính tiền điện
    const [selectedMonth, setSelectedMonth] = useState(
        getCurrentMonthValue(),
    );
    const [vatRate, setVatRate] = useState<VatRate>(0);
    const [estimateResult, setEstimateResult] =
        useState<ElectricityCostEstimate | null>(null);
    const [estimating, setEstimating] = useState(false);

    //Note
    const [notes, setNotes] = useState<UtilityNote[]>([]);
    const [noteContent, setNoteContent] = useState("");
    const [editingNote, setEditingNote] =
        useState<UtilityNote | null>(null);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [submittingNote, setSubmittingNote] =
        useState(false);

    //Thông báo
    const [feedback, setFeedback] =
        useState<Feedback | null>(null);

    //Lấy thông báo lỗi backend trả về
    function getErrorMessage(
        error: unknown,
        defaultMessage: string,
    ): string {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message;

            if (
                typeof message === "string" &&
                message.trim() !== ""
            ) {
                return message;
            }
        }

        return defaultMessage;
    }

    //Lấy danh sách ghi chú của người dùng
    async function loadUtilityNotes() {
        setLoadingNotes(true);

        try {
            const response = await getUtilityNotesApi();
            setNotes(response.utilityNotes ?? []);
        } catch (error: unknown) {
            setNotes([]);

            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể tải danh sách ghi chú.",
                ),
            });
        } finally {
            setLoadingNotes(false);
        }
    }

    //Gửi tháng và mức VAT để backend tính tiền điện
    async function handleEstimate() {
        if (selectedMonth === "") {
            setFeedback({
                type: "error",
                message: "Vui lòng chọn tháng cần ước tính.",
            });

            return;
        }

        setEstimating(true);
        setFeedback(null);

        try {
            const response =
                await estimateElectricityCostApi(
                    selectedMonth,
                    vatRate,
                );

            setEstimateResult(response.data);

            setFeedback({
                type: "success",
                message: response.message,
            });
        } catch (error: unknown) {
            setEstimateResult(null);

            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể ước tính tiền điện.",
                ),
            });
        } finally {
            setEstimating(false);
        }
    }

    //Thêm mới/ cập nhật ghi chú đang được chọn
    async function handleSaveNote() {
        const normalizedNote = noteContent.trim();

        if (normalizedNote === "") {
            setFeedback({
                type: "error",
                message: "Vui lòng nhập nội dung ghi chú.",
            });

            return;
        }

        setSubmittingNote(true);
        setFeedback(null);

        try {
            if (editingNote) {
                const response =
                    await updateUtilityNoteApi(
                        editingNote.id,
                        {
                            note: normalizedNote,
                        },
                    );

                setFeedback({
                    type: "success",
                    message: response.message,
                });
            } else {
                const response =
                    await createUtilityNoteApi({
                        note: normalizedNote,
                    });

                setFeedback({
                    type: "success",
                    message: response.message,
                });
            }

            //Đưa form ghi chú về trạng thái thêm mới
            setNoteContent("");
            setEditingNote(null);

            await loadUtilityNotes();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    editingNote
                        ? "Không thể cập nhật ghi chú."
                        : "Không thể tạo ghi chú.",
                ),
            });
        } finally {
            setSubmittingNote(false);
        }
    }

    //Đưa nội dung ghi chú vào form để chỉnh sửa
    function handleEditNote(note: UtilityNote) {
        setEditingNote(note);
        setNoteContent(note.note);
        setFeedback(null);
    }

    //Hủy chế độ chỉnh sửa và đưa form về trạng thái ban đầu
    function cancelEditNote() {
        if (submittingNote) {
            return;
        }

        setEditingNote(null);
        setNoteContent("");
    }

    //Xóa ghi chú sau khi người dùng xác nhận
    async function handleDeleteNote(note: UtilityNote) {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa ghi chú này?",
        );

        if (!confirmed) {
            return;
        }

        setSubmittingNote(true);
        setFeedback(null);

        try {
            const response =
                await deleteUtilityNoteApi(note.id);

            setFeedback({
                type: "success",
                message: response.message,
            });

            /*
             * Nếu ghi chú đang sửa bị xóa thì đưa form
             * trở lại trạng thái thêm mới.
             */
            if (editingNote?.id === note.id) {
                setEditingNote(null);
                setNoteContent("");
            }

            await loadUtilityNotes();
        } catch (error: unknown) {
            setFeedback({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể xóa ghi chú.",
                ),
            });
        } finally {
            setSubmittingNote(false);
        }
    }

    //Nạp danh sách ghi chú khi mở trang
    useEffect(() => {
        void loadUtilityNotes();
    }, []);

    return (
        <UserLayout>
            <header className="rounded-2xl bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                    Tiện ích
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Công cụ hỗ trợ sử dụng điện
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                    Ước tính chi phí điện theo tháng và lưu các ghi
                    chú cá nhân cần theo dõi.
                </p>
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

            {/* Ước tính tiền điện */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Ước tính tiền điện
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Kết quả được tính từ tổng điện năng đã ghi
                        nhận và biểu giá điện có hiệu lực.
                    </p>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleEstimate();
                    }}
                    className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_auto]"
                >
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Tháng cần ước tính
                        </span>

                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(event) =>
                                setSelectedMonth(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Thuế VAT
                        </span>

                        <select
                            value={vatRate}
                            onChange={(event) =>
                                setVatRate(
                                    Number(
                                        event.target.value,
                                    ) as VatRate,
                                )
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            {VAT_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={estimating}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        >
                            {estimating
                                ? "Đang tính..."
                                : "Ước tính"}
                        </button>
                    </div>
                </form>

                {estimateResult && (
                    <div className="mt-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm text-slate-500">
                                    Điện năng tiêu thụ
                                </p>

                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {formatEnergy(
                                        estimateResult.total_energy,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm text-slate-500">
                                    Tiền điện trước VAT
                                </p>

                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {formatCurrency(
                                        estimateResult.subtotal,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm text-slate-500">
                                    Tiền VAT (
                                    {estimateResult.vat_rate}%)
                                </p>

                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {formatCurrency(
                                        estimateResult.vat_amount,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm text-emerald-700">
                                    Tổng tiền ước tính
                                </p>

                                <p className="mt-2 text-xl font-semibold text-emerald-800">
                                    {formatCurrency(
                                        estimateResult.total_amount,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <p>
                                Tháng tính:{" "}
                                <strong>
                                    {estimateResult.month_label}
                                </strong>
                            </p>

                            <p className="mt-1">
                                Biểu giá áp dụng từ:{" "}
                                <strong>
                                    {formatUtilityDate(
                                        estimateResult.effective_from,
                                    )}
                                </strong>
                            </p>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">
                                            Bậc
                                        </th>

                                        <th className="px-4 py-3 font-semibold">
                                            Khoảng điện năng
                                        </th>

                                        <th className="px-4 py-3 text-right font-semibold">
                                            Điện năng tính
                                        </th>

                                        <th className="px-4 py-3 text-right font-semibold">
                                            Đơn giá
                                        </th>

                                        <th className="px-4 py-3 text-right font-semibold">
                                            Thành tiền
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {estimateResult.tier_details.map(
                                        (tier) => (
                                            <tr
                                                key={
                                                    tier.tier_order
                                                }
                                                className="border-b border-slate-100 last:border-b-0"
                                            >
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    Bậc{" "}
                                                    {
                                                        tier.tier_order
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatTierRange(
                                                        tier.from_kwh,
                                                        tier.to_kwh,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatEnergy(
                                                        tier.used_kwh,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatElectricityPrice(
                                                        tier.price_kwh,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    {formatCurrency(
                                                        tier.amount,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* Ghi chú cá nhân */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Ghi chú cá nhân
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Lưu lại các nội dung cần theo dõi trong quá
                        trình sử dụng điện.
                    </p>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSaveNote();
                    }}
                    className="mt-5"
                >
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Nội dung ghi chú
                        </span>

                        <textarea
                            value={noteContent}
                            onChange={(event) =>
                                setNoteContent(
                                    event.target.value,
                                )
                            }
                            rows={4}
                            disabled={submittingNote}
                            placeholder="Nhập nội dung cần ghi nhớ..."
                            className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100"
                        />
                    </label>

                    <div className="mt-3 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submittingNote}
                            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submittingNote
                                ? "Đang lưu..."
                                : editingNote
                                  ? "Cập nhật ghi chú"
                                  : "Thêm ghi chú"}
                        </button>

                        {editingNote && (
                            <button
                                type="button"
                                onClick={cancelEditNote}
                                disabled={submittingNote}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Hủy chỉnh sửa
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-6 border-t border-slate-200 pt-5">
                    <h3 className="font-semibold text-slate-900">
                        Danh sách ghi chú
                    </h3>

                    {loadingNotes ? (
                        <p className="mt-4 text-sm text-slate-500">
                            Đang tải danh sách ghi chú...
                        </p>
                    ) : notes.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">
                            Bạn chưa có ghi chú nào.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {notes.map((note) => (
                                <article
                                    key={note.id}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                                        {note.note}
                                    </p>

                                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-xs text-slate-500">
                                            <p>
                                                Tạo lúc:{" "}
                                                {formatUtilityDateTime(
                                                    note.created_at,
                                                )}
                                            </p>

                                            {note.updated_at !==
                                                note.created_at && (
                                                <p className="mt-1">
                                                    Cập nhật:{" "}
                                                    {formatUtilityDateTime(
                                                        note.updated_at,
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEditNote(
                                                        note,
                                                    )
                                                }
                                                disabled={
                                                    submittingNote
                                                }
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Sửa
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleDeleteNote(
                                                        note,
                                                    )
                                                }
                                                disabled={
                                                    submittingNote
                                                }
                                                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </UserLayout>
    );
}