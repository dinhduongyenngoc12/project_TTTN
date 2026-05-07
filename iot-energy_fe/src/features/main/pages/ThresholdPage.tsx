import { useState } from "react";
import { useLogoutForm } from "../../auth/hooks/useAuthForm";

const menuItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Thiết bị", path: "/devices" },
    { label: "Lịch sử điện năng", path: "/energy-history" },
    { label: "Cảnh báo", path: "/alerts" },
    { label: "Cài đặt Ngưỡng", path: "/threshold-settings" },
];

function getMenuItemClass(isActive: boolean) {
    const commonClass = "min-w-fit rounded-2xl px-4 py-3";
    const selectedClass = "bg-emerald-500 text-white";
    const normalClass = "bg-slate-50 text-slate-600";

    if (isActive) {
        return commonClass + " " + selectedClass;
    }

    return commonClass + " " + normalClass;
}

export default function ThresholdPage(){
    const {handleLogout} = useLogoutForm();
    
}
