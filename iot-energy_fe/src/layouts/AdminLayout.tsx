import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthLoginStore } from "../app/store/useAuthStore";
import { useLogoutForm } from "../features/auth/hooks/useAuthForm";

type AdminLayoutProps = {
    children: ReactNode;
};

type AdminMenuItem = {
    label: string;
    path: string;
};

const menuItems: AdminMenuItem[] = [
    {
        label: "Tổng quan", path: "/admin"
    },
    {
        label: "Người dùng", path: "/admin/users"
    },
    {
        label: "Bộ đo IoT", path: "/admin/iot-devices"
    },
    {
        label: "Giám sát", path: "/admin/monitoring"
    },
    {
        label: "Bảng giá điện", path: "/admin/electricity-prices"
    },
];

function isMenuItemActive(
    pathname: string,
    itemPath: string,
): boolean {
    /*
     * /admin chỉ active khi đang ở đúng trang tổng quan.
     *
     * Các menu còn lại được active cả ở route con:
     * /admin/users/5 vẫn active menu Người dùng.
     */
    if (itemPath === "/admin") {
        return pathname === "/admin";
    }

    return (
        pathname === itemPath ||
        pathname.startsWith(itemPath + "/")
    );
}

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    const location = useLocation();
    const { username } = useAuthLoginStore();
    const { handleLogout } = useLogoutForm();

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Sidebar desktop */}
            <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 text-white lg:flex">
                <div className="border-b border-slate-800 pb-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                        IoT Energy
                    </p>

                    <h1 className="mt-2 text-xl font-semibold">
                        Quản trị hệ thống
                    </h1>

                    <p className="mt-2 truncate text-sm text-slate-400">
                        {username ?? "Administrator"}
                    </p>
                </div>

                <nav className="mt-6 flex flex-1 flex-col gap-1">
                    {menuItems.map((item) => {
                        const active = isMenuItemActive(
                            location.pathname,
                            item.path,
                        );

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={
                                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors " +
                                    (active
                                        ? "bg-emerald-500 text-slate-950"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white")
                                }
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-5 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-red-400 hover:bg-red-500 hover:text-white"
                >
                    Đăng xuất
                </button>
            </aside>

            {/* Header và menu mobile/tablet */}
            <header className="border-b border-slate-200 bg-white lg:hidden">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                            IoT Energy
                        </p>

                        <p className="mt-1 text-base font-semibold text-slate-900">
                            Quản trị hệ thống
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                        Đăng xuất
                    </button>
                </div>

                <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3 sm:px-6">
                    {menuItems.map((item) => {
                        const active = isMenuItemActive(
                            location.pathname,
                            item.path,
                        );

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={
                                    "shrink-0 rounded-lg px-3 py-2 text-sm font-medium " +
                                    (active
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "text-slate-600 hover:bg-slate-100")
                                }
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-64 lg:p-8">
                {children}
            </main>
        </div>
    );
}