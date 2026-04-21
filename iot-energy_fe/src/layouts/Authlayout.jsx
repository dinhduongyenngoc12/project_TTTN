export default function AuthLayout({ children }) {
    return (
        <>
            <header className="p-4 bg-blue-500 text-white">
                LOGIN LAYOUT 
            </header>

            <main className="p-4">
                {children}
            </main>
        </>
    )
}