import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { resetPasswordApi } from "../../services/ForgotPassService";
import { BackGround } from "../../shared/components/BackGround";


export default function ResetPassPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [msg, setMsg] = useState("");
    const [isPending, setIsPending] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token") || "";

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isPending) return;

        if (!token) {
            setMsg("Liên kết đặt lại mật khẩu không hợp lệ");
            return;
        }

        if (!password.trim()) {
            setMsg("Vui lòng nhập mật khẩu mới");
            return;
        }

        if (!/^[0-9]{8}$/.test(password.trim())) {
            setMsg("Mật khẩu phải gồm đúng 8 chữ số");
            return;
        }

        if (password.trim() !== confirmPassword.trim()) {
            setMsg("Mật khẩu xác nhận không khớp");
            return;
        }

        setMsg("");
        setIsPending(true);

        try {
            const data = await resetPasswordApi({
                token,
                password: password.trim(),
            });

            if (data?.status === "success") {
                navigate("/login", {
                    replace: true,
                });
                return;
            }

            setMsg(data?.message || "Đặt lại mật khẩu thất bại");
        } catch (error: any) {
            setMsg(error?.response?.data?.message || "Đặt lại mật khẩu thất bại");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 sm:py-10">
            <div className="m-0 flex w-full max-w-screen-xl flex-1 justify-center overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="w-full p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
                    <div className="mt-12 flex flex-col items-center">
                        <div className="mt-8 w-full flex-1">
                            <div className="my-12 border-b text-center">
                                <div className="inline-block translate-y-1/2 bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600">
                                    Đặt lại mật khẩu
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                <p className="mb-5 text-center text-sm text-gray-600">
                                    Nhập mật khẩu mới cho tài khoản của bạn.
                                </p>

                                <Input
                                    type="password"
                                    name="password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Mật khẩu mới"
                                />

                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Xác nhận mật khẩu"
                                />

                                <Button title="ĐẶT LẠI MẬT KHẨU" disabled={isPending} />

                                {msg && (
                                    <p className="mt-3 text-center text-sm text-red-500">
                                        {msg}
                                    </p>
                                )}

                                <p className="mt-5 text-center text-sm text-gray-600">
                                    Quay lại -{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                                    >
                                        Đăng nhập
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
                <BackGround />
            </div>
        </div>
    );
}