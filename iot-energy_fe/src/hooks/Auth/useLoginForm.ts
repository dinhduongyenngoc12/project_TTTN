import { useLoginData } from "./useLoginData";

export function useLoginForm() {
    const { mutation } = useLoginData();

    const handleLogin = ({ email, password }: { email: string; password: string }) => {
        mutation.mutate({
            email,
            password,
        });
    };

    return {
        handleLogin,
        isPending: mutation.isPending,      //trang thai cua useMutation trong tanstack
        error: mutation.error,
        data: mutation.data,
    };
}
