import { create } from "zustand";

type AuthState = {
    token: string | null;
    user: any;
    setAuth: (data: { token: string; user: any }) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,

    setAuth: (data) =>
        set({
            token: data.token,
            user: data.user,
        }),

    //xoa khi logout
    clearAuth: () =>
        set({
            token: null,
            user: null,
        }),
}));
