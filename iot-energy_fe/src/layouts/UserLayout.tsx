import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLogoutForm } from "../features/auth/hooks/useAuthForm";

type UserLayoutProps = {
    children: ReactNode;
};

type UserMenuItem = {
    label: string;
    path: string;
};

const userMenuItems: UserMenuItem[] = [
    { label: "Trang chủ", path: "/dashboard" },
    { label: "Thiết bị", path: "/devices" },
    { label: "Cấu hình ngưỡng", path: "/thresholds" },
    { label: "Thống kê", path: "/statistics" },
    { label: "Cảnh báo", path: "/alerts" },
    { label: "Tiện ích", path: "/utilities" },
];

function getDesktopMenuItemClass(isActive: boolean): string {
    const commonClass =
        "border-b-2 px-1 py-2 text-sm font-medium transition-colors";

    const selectedClass =
        "border-emerald-600 text-emerald-700";

    const normalClass =
        "border-transparent text-slate-600 hover:text-slate-900";

    return `${commonClass} ${
        isActive ? selectedClass : normalClass
    }`;
}

function getMobileMenuItemClass(isActive: boolean): string {
    const commonClass =
        "block rounded-lg px-4 py-3 text-sm font-medium transition-colors";

    const selectedClass =
        "bg-emerald-50 text-emerald-700";

    const normalClass =
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

    return `${commonClass} ${
        isActive ? selectedClass : normalClass
    }`;
}

export default function UserLayout({ children }: UserLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { handleLogout } = useLogoutForm();

    function closeMobileMenu() {
        setIsMenuOpen(false);
    }

    function handleMobileLogout() {
        closeMobileMenu();
        handleLogout();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <NavLink
                        to="/dashboard"
                        className="flex items-center gap-3"
                        onClick={closeMobileMenu}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
                            IE
                        </div>

                        <div>
                            <p className="text-lg font-semibold text-slate-900">
                                IoT Energy
                            </p>

                            <p className="text-xs text-slate-500">
                                Giám sát điện năng
                            </p>
                        </div>
                    </NavLink>

                    {/* Menu desktop */}
                    <nav className="hidden items-center gap-7 lg:flex">
                        {userMenuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    getDesktopMenuItemClass(isActive)
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Đăng xuất trên desktop */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="hidden rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white lg:inline-flex"
                    >
                        Đăng xuất
                    </button>

                    {/* Nút đóng/mở menu mobile */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((current) => !current)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
                        aria-label={
                            isMenuOpen ? "Đóng menu" : "Mở menu"
                        }
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-user-menu"
                    >
                        {isMenuOpen ? (
                            <X size={28} aria-hidden="true" />
                        ) : (
                            <Menu size={30} aria-hidden="true" />
                        )}
                    </button>
                </div>

                {/* Menu mobile */}
                {isMenuOpen && (
                    <div
                        id="mobile-user-menu"
                        className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:hidden"
                    >
                        <nav className="mx-auto flex max-w-screen-2xl flex-col gap-1">
                            {userMenuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        getMobileMenuItemClass(isActive)
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}

                            <button
                                type="button"
                                onClick={handleMobileLogout}
                                className="mt-3 rounded-lg border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}