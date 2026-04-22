import { useState } from "react";
import { ButtonSocial } from "../../components/ButtonSocial";
import { Button } from "../../components/Button";
import { useLoginForm } from "../../hooks/Auth/useLoginForm";
import { Input } from "../../components/Input";

const illustrationUrl =
    "https://drive.google.com/uc?export=view&id=1KZ_Ub_2lZ0dHbKV0fAIhxVhiQA183RCz";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { handleLogin } = useLoginForm();

    const handleSubmit = (event) => {
        event.preventDefault();
      
        handleLogin({
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
                            <div className="flex flex-col items-center">
                                <ButtonSocial />
                            </div>

                            <div className="my-12 border-b text-center">
                                <div className="inline-block translate-y-1/2 bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600">
                                    Or sign in with Electrical energy management system E-mail
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                <Input
                                    type={'email'}
                                    name={'email'}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder={'Email'}
                                    
                                />
                                  <Input
                                    type={'password'}
                                    name={'password'}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder={'Password'}
                                />

                              

                                <Button title="Login"/>

                                <p className="mt-6 text-center text-xs text-gray-600">
                                    I agree to abide by electrical energy management system{" "}
                                    <a
                                        href="#"
                                        className="border-b border-dotted border-gray-500"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and its{" "}
                                    <a
                                        href="#"
                                        className="border-b border-dotted border-gray-500"
                                    >
                                        Privacy Policy
                                    </a>
                                    .
                                </p>
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
