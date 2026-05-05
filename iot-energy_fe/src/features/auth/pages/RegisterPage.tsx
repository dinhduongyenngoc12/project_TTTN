import { useState } from "react";
import { useRegisterForm } from "../hooks/useAuthForm";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";

const illustrationUrl =
    "https://drive.google.com/uc?export=view&id=1KZ_Ub_2lZ0dHbKV0fAIhxVhiQA183RCz";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { handleRegister, isPending } = useRegisterForm();

    const handleSubmit = (event: any) => {
        event.preventDefault();

        handleRegister({
            username,
            email,
            password,
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
                                    ĐĂNG KÍ TÀI KHOẢN 
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                <Input
                                    type="username"
                                    name="username"
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="Username"
                                />

                                <Input
                                    type="email"
                                    name="email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Email"
                                />

                                <Input
                                    type="password"
                                    name="password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                />

                                <Button title="ĐĂNG KÍ" disabled={isPending} />
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