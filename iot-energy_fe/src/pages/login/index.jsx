import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 inline">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded bg-blue-600 py-2 text-white">
          Login
        </button>
      </div>
    </div>
  );
}