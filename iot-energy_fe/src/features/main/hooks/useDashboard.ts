import { useQuery } from "@tanstack/react-query";
import { getDashboardApi } from "../../../api/dashboardApi";

export const useDashboard = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboardApi,
        refetchInterval: 60000,
    });
};