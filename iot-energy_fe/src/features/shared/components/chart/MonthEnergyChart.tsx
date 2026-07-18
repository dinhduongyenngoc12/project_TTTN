import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useMonthEnergy } from "../../../main/hooks/useMonthEnergy";
import { useAvailableYear } from "../../../main/hooks/useAvailableYear";

type MonthEnergyItem = {
    year: number;
    month: number;
    label: string;
    energy: string | number | null;
};

type ChartDataItem = {
    year: number;
    month: number;
    label: string;
    energy: number;
};

function getCurrentYear() {
    return new Date().getFullYear();
}

function buildChartData(items: MonthEnergyItem[] = []): ChartDataItem[] {
    return items.map((item) => ({
        year: Number(item.year),
        month: Number(item.month),
        label: item.label,
        energy: Number(item.energy ?? 0),
    }));
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0].payload as ChartDataItem;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg">
            <p className="font-semibold text-slate-800">
                {label}/{item.year}
            </p>

            <p className="mt-1 text-slate-600">
                Điện năng tiêu thụ:{" "}
                <span className="font-semibold text-slate-900">
                    {item.energy.toFixed(3)} kWh
                </span>
            </p>
        </div>
    );
}

function CustomBarShape(props: any) {
    return (
        <rect
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
            rx={8}
            ry={8}
            fill="#10b981"
        />
    );
}

export default function MonthEnergyChart() {
    const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());

    const { data, isLoading, isError } = useMonthEnergy(selectedYear);
    const { data: yearsData } = useAvailableYear();

    const years: number[] = yearsData?.data ?? [getCurrentYear()];
    const chartData = buildChartData(data?.data);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        Dữ liệu điện năng tiêu thụ theo 12 tháng trong năm được chọn.
                    </p>

                    {data?.summary && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Tổng điện năng</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {Number(data.summary.total_energy ?? 0).toFixed(3)} kWh
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Tháng cao nhất</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {data.summary.highest_month?.label ?? "Chưa có dữ liệu"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Đơn vị</p>
                                <p className="mt-1 text-lg font-bold text-emerald-600">
                                    kWh
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <label className="mb-2 block text-xs font-semibold text-emerald-700">
                        Chọn năm
                    </label>

                    <select
                        value={selectedYear}
                        onChange={(event) => setSelectedYear(Number(event.target.value))}
                        className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
            )}

            {isError && (
                <div className="text-sm text-red-500">
                    Không thể tải dữ liệu thống kê theo tháng.
                </div>
            )}

            {!isLoading && !isError && (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tick={{
                                fill: "#475569",
                                fontSize: 12,
                                fontWeight: 600,
                                fontFamily: "inherit",
                            }}
                        />

                        <YAxis
                            tick={{
                                fill: "#475569",
                                fontSize: 12,
                                fontWeight: 600,
                                fontFamily: "inherit",
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="energy"
                            name="Điện năng tiêu thụ (kWh)"
                            shape={<CustomBarShape />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}