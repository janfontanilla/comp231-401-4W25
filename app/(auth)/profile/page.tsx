"use client"; // This directive marks the component as a Client Component

import { useState, useEffect } from "react";

function Profile() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        password: "",
        confPassword: "",
    });
    const [name, setName] = useState("");
    const [isLoading, setLoading] = useState(true)

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.password || !formData.confPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (formData.password !== formData.confPassword) {
            setError("Passwords do not match");
            return;
        }

        const password = formData.password;

        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
            // router.push("/organization/default-org");
        }
    };

    useEffect(() => {
        fetch('/api/profile')
            .then((res) => res.json())
            .then((data) => {
                setEmail(data.email);
                setName(data.name);
                setLoading(false);
            })
    }, [])

    if (isLoading) return <p>Loading...</p>

    return (

        <div className="flex flex-col items-center justify-center screen-height py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl mb-6">Profile</h2>
            {message != "" && (
                <div className="alert alert-success text-xs text-green-600" role="alert">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                    type="text"
                    className="ml-4 border rounded p-2"
                    id="name"
                    value={name}
                    readOnly
                />
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    type="email"
                    className="ml-4 border rounded p-2"
                    id="email"
                    value={email}
                    readOnly
                />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    type="password"
                    className="ml-4 border rounded p-2"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                />
                <label htmlFor="confPassword" className="form-label">Confirm Password</label>
                <input
                    type="password"
                    className="ml-4 border rounded p-2"
                    id="confPassword"
                    name="confPassword"
                    onChange={handleChange}
                    value={formData.confPassword}
                />
                <div>
                    {error && (
                        <div className="alert alert-danger text-xs text-red-600" role="alert">
                            {error}
                        </div>
                    )}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Reset Password
                    </button>
                </div>

            </form>
        </div>
    );
}

export default Profile;