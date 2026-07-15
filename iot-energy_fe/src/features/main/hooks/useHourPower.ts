import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../../api/statisticsApi";

export const useHourPower = (date?: string) => {
    return useQuery({
        queryKey: ["hour-power", date],
        queryFn: () => statisticsApi.getHourPower(date)     //React Query gọi arrow function, rồi arrow function mới gọi API với đúng tham số
    });
};