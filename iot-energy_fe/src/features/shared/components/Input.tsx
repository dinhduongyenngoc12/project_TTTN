import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/ultils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ type = "text", className, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm font-medium placeholder-gray-500 focus:border-gray-400 focus:bg-white focus:outline-none",
        className || ""
      )}
      {...props}
    />
  );
}