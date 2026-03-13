"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user info
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user_id) localStorage.setItem("user_id", data.user_id);

        // Redirect to chat page
        router.push("/chat");
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-black to-purple-900">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-700 p-10 rounded-xl shadow-lg text-center w-96 space-y-4"
        >
          <h1 className="text-3xl font-bold mb-6 text-white">Login</h1>

          {message && <p className="text-red-500">{message}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
