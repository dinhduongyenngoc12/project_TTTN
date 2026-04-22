// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getData, postData } from "../../services/Auth/TodoService";

// export function useLoginData() {
//     const queryClient = useQueryClient();

//     // GET (query)
//     const query = useQuery({
//         queryKey: ["todos"],
//         queryFn: getData,
//     });

//     // POST (mutation)
//     const mutation = useMutation({
//         mutationFn: postData,
//         onSuccess: () => {
//             // reload ds
//             queryClient.invalidateQueries({ queryKey: ["todos"] });
//         },
//     });

//     return {
//         query,
//         mutation,
//     };
// }

import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/Auth/LoginService";
import { useAuthStore } from "../../stores/Auth/authStore";

export function useLoginData() {
    const setAuth = useAuthStore((state) => state.setAuth);

    const mutation = useMutation({           //useMutation danh cho POST/PUT/PATCH/DELETE
        mutationFn: loginApi,                //useQuery danh chp GET
        onSuccess: (data) => {
            setAuth({                        //user, token luu vao global state
                token: data.token,
                user: data.user,
            });
        },
    });

    return {
        mutation,
    };
}
