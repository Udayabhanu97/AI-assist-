"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle normal registration
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (form.password !== form.confirm_password) {
  //     setMessage("Passwords do not match");
  //     return;
  //   }

  //   try {
  //     const res = await fetch("http://127.0.0.1:8000/api/users/register/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         full_name: form.full_name,
  //         email: form.email,
  //         phone: form.phone,
  //         password: form.password,
  //       }),
  //     });

  //     const data = await res.json();
  //     setMessage(data.message || "Registration successful");

  //     if (res.ok) {
  //       setTimeout(() => {
  //         router.replace("/login");
  //       }, 1500);
  //     }
  //   } catch (error) {
  //     setMessage("Server error. Try again.");
  //   }
  // };



  const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");

  if (form.password !== form.confirm_password) {
    setMessage("Passwords do not match");
    return;
  }

  try {

    const res = await fetch("http://127.0.0.1:8000/api/users/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || data.message);
      return;
    }

    setMessage("Registration successful 🎉");

    setTimeout(() => {
      router.replace("/login");
    }, 1500);

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to server");
  }
};


  // Redirect to Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
  };

  // Redirect to Microsoft OAuth login
  const handleMicrosoftLogin = () => {
    window.location.href = "http://127.0.0.1:8000/accounts/microsoft/login/";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side Branding */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center bg-cover bg-center relative "
        style={{
          backgroundImage:
            "url('/banner/rm373batch5-18a.jpg')",
        }}
      >
        <div className="text-white  px-12">
          <h1 className="text-4xl font-bold mb-4 absolute top-20 inset-0 left-20 px-9">AI Assistant Platform</h1>
          
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="relative bg-gray-100 p-8 rounded-2xl shadow-xl w-96 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center  text-black">Create Account</h2>

          {message && (
            <p
              className={`text-center ${
                message.includes("successful") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg outline-none text-black"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg text-black"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg text-black"
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg text-black"
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded-lg text-black"
            onChange={handleChange}
            required
          />

          <label className="flex items-center text-sm text-black">
            <input type="checkbox" className="mr-2 " required/>
            I agree to the Terms & Conditions
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition  text-black shadow-md"
          >
            Register
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Buttons */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-100 text-black shadow-md"
          >
            <FaGoogle /> Continue with Google
          </button>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className="w-full flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-100  text-black shadow-md"
          >
            <FaMicrosoft /> Continue with Microsoft
          </button>

          <p className="text-center text-sm font-bold text-red-500">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer text-sm font-bold"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
