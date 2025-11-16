"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./_components/Login.css";
import { setCookie } from "cookies-next";

function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            setError(data.message || "Login failed");
            return;
        } else {
            setCookie("userId", data.user.id);
            router.push("/organization/default-org");
        }
    };

    return (

        <div className="flex flex-col items-center justify-center screen-height py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl mb-6">Sign In</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="ml-4 border rounded p-2"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />

                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="ml-4 border rounded p-2"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {error && (
                    <div className="text-xs text-red-700 text-center mt-4" role="alert">
                        {error}
                    </div>
                )}

                <div className="text-center mt-5 mb-4">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Sign In
                    </button>
                </div>
            </form>

            <div className="text-center">
                <p className="mb-0">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-fg-brand hover:underline text-blue-500">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
