import { cn } from "@/lib/ultils";

export function Input({ type = 'text', name, placeholder, className, onChange }) {

    return (
        <input type={type}
            className={cn('w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm font-medium placeholder-gray-500 focus:border-gray-400 focus:bg-white focus:outline-none',
                className ? className : ''
            )}
            name={name}
            placeholder={placeholder}
            required
            onChange={onChange}
        />

    );
}