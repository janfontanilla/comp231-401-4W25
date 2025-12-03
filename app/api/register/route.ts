/**
 * @fileoverview User Registration API Route
 * @description Handles new user registration with validation
 * @author Jan Rafael
 */

import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

/**
 * POST /api/register - Register a new user account
 * 
 * @description Creates a new user in the database with hashed password.
 * Validates email format, password length (min 6 chars), and name length (min 2 chars).
 * Uses bcrypt with cost factor 10 for secure password hashing.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body containing user data
 * @param {string} request.body.name - User's display name (min 2 characters)
 * @param {string} request.body.email - User's email address (must be valid format)
 * @param {string} request.body.password - User's password (min 6 characters)
 * 
 * @returns {Promise<NextResponse>} JSON response with result
 * @returns {201} Success - User created successfully
 * @returns {400} Bad Request - Missing or invalid input fields
 * @returns {409} Conflict - Email already exists
 * @returns {500} Server Error - Database or server error
 * 
 * @example
 * // Request
 * POST /api/register
 * { "name": "John Doe", "email": "john@example.com", "password": "secret123" }
 * 
 * // Success Response (201)
 * { "message": "Registration successful", "user": { "id": "...", "email": "...", "name": "..." } }
 */
export async function POST(request: Request) {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
        return NextResponse.json({ message: 'Email, password and name are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length < 2) {
        return NextResponse.json({ message: 'Name must be at least 2 characters' }, { status: 400 });
    }

    try {
        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
        }

        /**
         * Hash password using bcrypt algorithm
         * Cost factor 10 = 2^10 = 1024 iterations for security
         */
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
            },
        });
        return NextResponse.json({ message: 'Registration successful', user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
