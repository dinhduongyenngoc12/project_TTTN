import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../../api/statisticsApi";

export const useMonthEnergy = (year?: number) => {
    return useQuery({
        queryKey: ["month-energy", year],
        queryFn: () => statisticsApi.getMonthEnergy(year)     //React Query gọi arrow function, rồi arrow function mới gọi API với đúng tham số
    });
};