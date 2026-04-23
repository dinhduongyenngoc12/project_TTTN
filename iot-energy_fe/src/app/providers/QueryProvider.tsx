import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../services/queryClient";

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}