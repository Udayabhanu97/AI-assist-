"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-black text-white">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => router.push("/")}
      >
        AI Assistant
      </h1>

      <div className="space-x-4">
        <button onClick={() => router.push("/login")}>
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Register
        </button>
      </div>
    </nav>
  );
}
