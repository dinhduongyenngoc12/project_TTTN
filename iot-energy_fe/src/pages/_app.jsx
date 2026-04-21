import "../assets/css/global.css";
import AuthLayout from "../layouts/Authlayout";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App({ Component, pageProps }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthLayout>
        <Component {...pageProps} />
      </AuthLayout>
    </QueryClientProvider>
  );
}