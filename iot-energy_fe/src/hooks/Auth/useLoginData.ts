import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "../../services/Auth/TodoService";

export function useLoginData() {
    const queryClient = useQueryClient();

    // GET (query)
    const query = useQuery({
        queryKey: ["todos"],
        queryFn: getData,
    });

    // POST (mutation)
    const mutation = useMutation({
        mutationFn: postData,
        onSuccess: () => {
            // reload ds
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    return {
        query,
        mutation,
    };
}