import { axiosClient } from "../lib/axiosClient";

export const statisticsApi = {
    getHourPower: async (date?: string) => {
        const response = await axiosClient.get("/api/statistics/hour-power", {
            params: { date },
        });
        return response.data;
    },

    getDayEnergy: async (month?: string) => {
        const response = await axiosClient.get("/api/statistics/day-energy", {
            params: { month },
        });
        return response.data;
    },

    getMonthEnergy: async (year?: number) => {
        const response = await axiosClient.get("/api/statistics/month-energy", {
            params: { year },
        });
        return response.data;
    },

    getAvailableYear: async () => {
        const response = await axiosClient.get("/api/statistics/available-years");
        return response.data;
    },
};