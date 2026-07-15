import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useHourPower } from "../../../main/hooks/useHourPower";

type HourPowerItem = {
    hour: string | number;
    power: string | number | null;
};

type TimePeriod = "low" | "normal" | "peak";

type ChartDataItem = {
    hour: string;
    power: number;
    period: TimePeriod;
};

type TooltipProps = {
    active?: boolean;
    payload?: {
        payload: ChartDataItem;
    }[];
    label?: string;
};

type XAxisTickProps = {
    x?: number;
    y?: number;
    payload?: {
        value: string;
    };
};

type BarShapeProps = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: ChartDataItem;
};

const PERIOD_LABELS: Record<TimePeriod, string> = {
    low: "Thấp điểm",
    normal: "Bình thường",
    peak: "Cao điểm",
};

const PERIOD_COLORS: Record<TimePeriod, string> = {
    peak: "#f97316",
    normal: "#10b981",
    low: "#2563eb",
};

function getTodayInfo() {
    const today = new Date();

    return {
        dayOfWeek: today.getDay(), //trong JavaScript: 0 = Chủ nhật, 1 = Thứ hai,...
        label: today.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    };
}

function getTimePeriod(hour: number, dayOfWeek: number): TimePeriod {
    if (hour >= 0 && hour < 6) {
        return "low";
    }

    //ngày Chủ nhật không có giờ cao điểm
    if (dayOfWeek !== 0 && hour >= 18 && hour <= 22) {
        return "peak";
    }

    return "normal";
}

function normalizeHour(hour: string | number): string {
    //chuyển "5", 5, "05:00" thành "05"
    return String(hour).slice(0, 2).padStart(2, "0");
}

function buildPowerMap(items: HourPowerItem[] = []): Map<string, number> {
    const powerByHour = new Map<string, number>();

    items.forEach((item) => {
        const hourKey = normalizeHour(item.hour);
        powerByHour.set(hourKey, Number(item.power ?? 0));
    });

    return powerByHour;
}

function buildChartData(
    items: HourPowerItem[] = [],
    dayOfWeek: number
): ChartDataItem[] {
    const powerByHour = buildPowerMap(items);

    //tạo đủ 24 giờ để biểu đồ không bị thiếu cột
    return Array.from({ length: 24 }, (_, hour) => {
        const hourKey = String(hour).padStart(2, "0");

        return {
            hour: hourKey + ":00",
            power: powerByHour.get(hourKey) ?? 0,
            period: getTimePeriod(hour, dayOfWeek),
        };
    });
}

function CustomXAxisTick({ x = 0, y = 0, payload }: XAxisTickProps) {
    const hour = Number(String(payload?.value ?? "00:00").slice(0, 2));
    const today = getTodayInfo();
    const period = getTimePeriod(hour, today.dayOfWeek);

    return (
        <text
            x={x}
            y={y + 14}
            textAnchor="middle"
            fill={PERIOD_COLORS[period]}
            fontSize={12}
            fontWeight={600}
        >
            {payload?.value}
        </text>
    );
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg">
            <p className="font-semibold text-slate-800">{label}</p>

            <p className="mt-1 text-slate-600">
                Công suất TB:{" "}
                <span className="font-semibold text-slate-900">
                    {item.power.toFixed(2)} W
                </span>
            </p>

            <p className="mt-1 text-slate-600">
                Khung giờ:{" "}
                <span
                    className="font-semibold"
                    style={{ color: PERIOD_COLORS[item.period] }}
                >
                    {PERIOD_LABELS[item.period]}
                </span>
            </p>
        </div>
    );
}

function CustomBarShape({ x = 0, y = 0, width = 0, height = 0, payload }: BarShapeProps) {
    const period = payload?.period ?? "normal";

    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={8}
            ry={8}
            fill={PERIOD_COLORS[period]}
        />
    );
}

function PeriodLegend() {
    const items: TimePeriod[] = ["peak", "normal", "low"];

    return (
        <div className="flex flex-wrap gap-3 text-sm">
            {items.map((period) => (
                <div key={period} className="flex items-center gap-2">
                    <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PERIOD_COLORS[period] }}
                    />
                    <span>{PERIOD_LABELS[period]}</span>
                </div>
            ))}
        </div>
    );
}

function TimePeriodNote() {
    return (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
                Quyết định số 963/QĐ-BCT về khung giờ cao điểm, thấp điểm và giờ bình thường của hệ thống điện quốc gia:
            </p>

            <h6 className="mt-2 font-bold text-slate-700">
                Khung giờ cao điểm áp dụng:
            </h6>
            <p>
                <span className="italic">Các ngày từ thứ Hai đến thứ Bảy:</span> từ 17h30 đến 22h30.
            </p>
            <p>
                <span className="italic">Ngày Chủ nhật:</span> không có giờ cao điểm.
            </p>

            <h6 className="mt-2 font-bold text-slate-700">
                Khung giờ bình thường áp dụng:
            </h6>
            <p>
                <span className="italic">Các ngày từ thứ Hai đến thứ Bảy:</span> từ 06h00 đến 17h30 và từ 22h30 đến 24h00.
            </p>
            <p>
                <span className="italic">Ngày Chủ nhật:</span> từ 06h00 đến 24h00.
            </p>

            <h6 className="mt-2 font-bold text-slate-700">
                Khung giờ thấp điểm áp dụng:
            </h6>
            <p>
                <span className="italic">Tất cả các ngày trong tuần:</span> từ 00h00 đến 06h00.
            </p>

            <p className="mt-3 text-xs italic text-slate-500">
                Lưu ý: Biểu đồ đang thống kê theo từng giờ, nên khung giờ 17h30 - 22h30 được thể hiện gần đúng theo các mốc giờ tròn.
            </p>
        </div>
    );
}

export default function HourPowerChart() {
    const { data, isLoading, isError } = useHourPower();
    const today = getTodayInfo();

    if (isLoading) {
        return <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>;
    }

    if (isError) {
        return (
            <div className="text-sm text-red-500">
                Không thể tải dữ liệu thống kê theo giờ.
            </div>
        );
    }

    const chartData = buildChartData(data?.data, today.dayOfWeek);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Dữ liệu công suất trung bình theo từng giờ trong ngày.
                </p>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span className="font-semibold">Hôm nay:</span>{" "}
                    {today.label}
                </div>
            </div>

            <PeriodLegend />

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tick={<CustomXAxisTick />} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="power"
                        name="Công suất trung bình (W)"
                        shape={<CustomBarShape />}
                    />
                </BarChart>
            </ResponsiveContainer>

            <TimePeriodNote />
        </div>
    );
}