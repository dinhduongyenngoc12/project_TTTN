import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { useLoginForm } from "../hooks/useAuthForm";
import { Link } from "react-router-dom";
import { BackGround } from "../../shared/components/BackGround";
import {
    clearAuthNotice,
    getAuthNotice,
} from "../../../app/utils/authSession";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authNotice, setAuthNotice] = useState(() => getAuthNotice());

    const { handleLogin, isPending, msg } = useLoginForm();

    //Thông báo được đọc một lần sau khi interceptor chuyển người dùng về trang đăng nhập.
    useEffect(() => {
        if (authNotice) {
            clearAuthNotice();
        }
    }, [authNotice]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthNotice("");

        handleLogin({
            email,
            password,

        });
    };

    // const clearOtpData = useOtpData((state) => state.clearOtpData);
    // useEffect(() => {
    //     clearOtpData();
    // }, [clearOtpData]);                  thay = AUTH GUARD tai guard

    return (
        <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 sm:py-10">
            <div className="m-0 flex w-full max-w-screen-xl flex-1 justify-center overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="w-full p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
                    <div className="mt-12 flex flex-col items-center">
                        <div className="mt-8 w-full flex-1">
                            <div className="flex flex-col items-center">

                            </div>

                            <div className="my-12 border-b text-center">
                                <div className="inline-block translate-y-1/2 bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600">
                                    Đăng nhập bằng Email
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                {authNotice && (
                                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        {authNotice}
                                    </div>
                                )}

                                <Input
                                    type={"email"}
                                    name={"email"}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder={"Email"}

                                />
                                <Input
                                    type={"password"}
                                    name={"password"}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder={"Mật khẩu"}
                                />

                                <p className="text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </p>


                                <Button title="ĐĂNG NHẬP" disabled={isPending} />
                                {msg && (
                                    <p
                                        className={`mt-3 text-center text-sm ${msg.includes("THÀNH CÔNG")
                                            ? "text-green-600"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {msg}
                                    </p>
                                )}

                                <p className="mt-5 text-center text-sm text-gray-600">
                                    Chưa có tài khoản?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                                    >
                                        Đăng ký
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
