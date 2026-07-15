import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../../api/statisticsApi";

export const useAvailableYear = () => {
    return useQuery({
        queryKey: ["available-years"],
        queryFn: () => statisticsApi.getAvailableYear(),
    });
};