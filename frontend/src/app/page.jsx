"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">

      <div className="text-center max-w-2xl">

        <h1 className="text-5xl font-bold mb-6">
          AI Assistant Platform
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Smart AI-powered assistant that helps you search information,
          chat with documents, generate images and get instant answers.
        </p>

        <div className="flex justify-center gap-6">

          <Link href="/register">
            <button className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
              Register
            </button>
          </Link>

          <Link href="/login">
            <button className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-800">
              Login
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}