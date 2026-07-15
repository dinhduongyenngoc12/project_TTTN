import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useDayEnergy } from "../../../main/hooks/useDayEnergy";

type DayEnergyItem = {
    date: string;
    day: number;
    label: string;
    energy: string | number | null;
};

type ChartDataItem = {
    date: string;
    day: number;
    label: string;
    energy: number;
};

function buildChartData(items: DayEnergyItem[] = []): ChartDataItem[] {
    return items.map((item) => ({
        date: item.date,
        day: Number(item.day),
        label: item.label, //dùng label BE 00/00
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
            <p className="font-semibold text-slate-800">{label}</p>

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

export default function DayEnergyChart() {
    const { data, isLoading, isError } = useDayEnergy();

    if (isLoading) {
        return <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>;
    }

    if (isError) {
        return (
            <div className="text-sm text-red-500">
                Không thể tải dữ liệu thống kê theo ngày.
            </div>
        );
    }

    const chartData = buildChartData(data?.data);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Dữ liệu điện năng tiêu thụ theo từng ngày trong tháng hiện tại.
                </p>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span className="font-semibold">Đơn vị:</span> kWh
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="label" />

                    <YAxis />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                        dataKey="energy"
                        name="Điện năng tiêu thụ (kWh)"
                        shape={<CustomBarShape />}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}