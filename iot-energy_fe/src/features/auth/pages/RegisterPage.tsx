import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    registerSchema,
    type RegisterFormValues,
} from "../../schemas/authSchema";
import { useRegisterForm } from "../hooks/useAuthForm";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { BackGround } from "../../shared/components/BackGround";


export default function RegisterPage() {
    // const [username, setUsername] = useState("");
    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    // const { handleRegister, isPending, msg } = useRegisterForm();

    // const handleSubmit = (event: any) => {
    //     event.preventDefault();

    //     handleRegister({
    //         username,
    //         email,
    //         password,
    //     });
    // };

    const { handleRegister, isPending, msg } = useRegisterForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const onSubmit = (data: RegisterFormValues) => {
        handleRegister(data);
    };

    return (
        <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 sm:py-10">
            <div className="m-0 flex w-full max-w-screen-xl flex-1 justify-center overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="w-full p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
                    <div className="mt-12 flex flex-col items-center">
                        <div className="mt-8 w-full flex-1">
                            <div className="my-12 border-b text-center">
                                <div className="inline-block translate-y-1/2 bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600">
                                    ĐĂNG KÝ TÀI KHOẢN
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xs">
                                <Input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    className={errors.username ? "border-red-500 bg-white" : ""}
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.username.message}
                                    </p>
                                )}

                                <Input
                                    type="email"
                                    placeholder="Email"
                                    className={errors.email ? "border-red-500 bg-white" : ""}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}

                                <Input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className={errors.password ? "border-red-500 bg-white" : ""}
                                    {...register("password")}
                                />

                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}

                                <Button title="ĐĂNG KÝ" disabled={isPending} />

                                {msg && (
                                    <p className="mt-3 text-center text-sm text-red-500">
                                        {msg}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
                <BackGround />
            </div>
        </div>
    );
}
