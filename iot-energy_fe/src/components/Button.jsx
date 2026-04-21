import { cn } from "@/lib/ultils";

export function Button({ type = 'submit', title = '', className, textClassName }) {
    return (
        <button type={type} className={cn("mt-5 flex w-full items-center justify-center rounded-lg bg-green-400 py-4 font-semibold tracking-wide text-white transition-all duration-300 ease-in-out hover:bg-green-700 focus:outline-none",
            className ? className : ''
        )}>
            <svg
                className="-ml-2 h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
            </svg>
            <span className={cn("ml-3", textClassName ? textClassName : '')}>{title}</span>
        </button>
    );
}
