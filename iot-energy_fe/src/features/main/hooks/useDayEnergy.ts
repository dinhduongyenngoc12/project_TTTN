import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../../api/statisticsApi";

export const useDayEnergy = (month?: string) => {
    return useQuery({
        queryKey: ["day-energy", month],
        queryFn: () => statisticsApi.getDayEnergy(month)    //React Query gọi arrow function, rồi arrow function mới gọi API với đúng tham số
    });
};

