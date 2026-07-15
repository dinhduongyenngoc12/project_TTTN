import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { forgotPasswordApi } from "../../services/ForgotPassService";
import { BackGround } from "../../shared/components/BackGround";

export default function ForgotPassPage() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isPending) return;

        if (!email.trim()) {
            setMsg("Vui lòng nhập email");
            return;
        }

        setMsg("");
        setIsPending(true);

        try {
            const data = await forgotPasswordApi({
                email: email.trim(),
            });

            if (data?.status === "success") {
                setMsg("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
                return;
            }

            setMsg(data?.message || "Gửi liên kết đặt lại mật khẩu thất bại");
        } catch (error: any) {
            setMsg(
                error?.response?.data?.message ||
                "Gửi liên kết đặt lại mật khẩu thất bại"
            );
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
                                    Quên mật khẩu
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                <p className="mb-5 text-center text-sm text-gray-600">
                                    Nhập email sử dụng để đăng ký tài khoản và nhận liên kết đặt lại mật khẩu qua email đó.
                                </p>

                                <Input
                                    type="email"
                                    name="email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Email"
                                />

                                <Button title="Gửi Email cho tôi" disabled={isPending} />

                                {msg && (
                                    <p className="mt-3 text-center text-sm text-red-500">
                                        {msg}
                                    </p>
                                )}

                                <p className="mt-5 text-center text-sm text-gray-600">
                                    Nhớ mật khẩu?{" "}
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
                <BackGround/>
            </div>
        </div>
    );
}