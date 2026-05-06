import { useState } from "react";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { useOTPForm, useResendOTPForm } from "../hooks/useAuthForm";

const illustrationUrl =
    "https://drive.google.com/uc?export=view&id=1KZ_Ub_2lZ0dHbKV0fAIhxVhiQA183RCz";

export default function OTPPage() {
    const [otp, setOTP] = useState("");

    // useEffect(() => {
    //     if (emailState) {
    //         setOTPData({ email: emailState });
    //         return;
    //     }

    //     if (!email) {
    //         navigate("/login", {
    //             replace: true,
    //             state: { message: "Email notfound. You have been redirected to the LOGIN page. Please try again." },
    //         });
    //     }
    // }, []);                              thay = AUTH GUARD tai guard

    const { handleOTP, msg, isPending } = useOTPForm();
    const { handleResendOTP, isPending: isResending, msg: resendMsg } = useResendOTPForm();

    const handleSubmit = (event: any) => {
        event.preventDefault();

        handleOTP({
            otp,
        });
    };

    return (
        <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 sm:py-10">
            <div className="m-0 flex w-full max-w-screen-xl flex-1 justify-center overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="w-full p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
                    <div className="mt-12 flex flex-col items-center">
                        <div className="mt-8 w-full flex-1">
                            <div className="my-12 border-b text-center">
                                <div className="inline-block translate-y-1/2 bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600">
                                    Vui lòng nhập mã OTP được nhận từ email vào Hệ thống Quản lý Năng lượng điện tại đây.
                                </div>
                            </div>
                            <div>{msg}</div>
                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">

                                <Input
                                    type={"otp"}
                                    name={"otp"}
                                    onChange={(event) => setOTP(event.target.value)}
                                    placeholder={"Mã OTP"}
                                />

                                <Button title="XÁC NHẬN" disabled={isPending} />
                                <p className="mt-5 text-center text-sm text-gray-600">
                                    Chưa nhận được mã OTP?
                                </p>
                                <Button
                                    type="button"
                                    title="Gửi lại mã"
                                    disabled={isResending}
                                    onClick={handleResendOTP}
                                    className="mt-3 border border-green-500 bg-white text-green-600 hover:bg-green-50"
                                    textClassName="text-green-600"

                                />

                                {resendMsg && (
                                    <p className="mt-3 text-center text-sm text-green-600">
                                        {resendMsg}
                                    </p>
                                )}

                            </form>
                        </div>
                    </div>
                </div>

                <div className="hidden flex-1 bg-green-100 text-center lg:flex">
                    <div
                        className="m-12 w-full bg-contain bg-center bg-no-repeat xl:m-16"
                        style={{ backgroundImage: `url("${illustrationUrl}")` }}
                    />
                </div>
            </div>
        </div>
    );
}
