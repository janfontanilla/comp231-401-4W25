"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./_components/Register.css";

function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email, 
                    password: formData.password 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show the specific error from API (e.g., "An account with this email already exists")
                setError(data.message || "Registration failed");
                setIsLoading(false);
                return;
            }

            // Success - redirect to login
            router.push("/login?registered=true");
        } catch (err) {
            setError("Network error. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="screen-height flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl mb-6">Create Account</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="ml-4 border rounded p-2"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        disabled={isLoading}
                    />

                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="ml-4 border rounded p-2"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                    />

                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="ml-4 border rounded p-2"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password (6+ chars)"
                        required
                        disabled={isLoading}
                    />
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="ml-4 border rounded p-2"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className="text-xs text-red-700 text-center mt-4 p-2 bg-red-50 rounded" role="alert">
                        {error}
                    </div>
                )}

                <div className="text-center mt-5 mb-4">
                    <button 
                        type="submit" 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>
                </div>
            </form>

            <div className="text-center">
                <p className="mb-0">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-fg-brand hover:underline text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
