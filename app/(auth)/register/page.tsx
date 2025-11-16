"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./_components/Register.css";

function Register() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const name = formData.name;;
        const email = formData.email;
        const password = formData.password;

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
            router.push("/organization/default-org");
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
                    />

                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="ml-4 border rounded p-2"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
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
                    />
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="text-center mt-5 mb-4">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Sign Up
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
