/**
 * @fileoverview User Login API Route
 * @description Handles user authentication and session management
 * @author Saeed Herzi
 */

import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_MAX_AGE } from '@/lib/constants';
import { logLogin, logLoginFailed } from '@/lib/access-log';

/**
 * POST /api/login - Authenticate user and create session
 * 
 * @description Validates user credentials against database, compares hashed passwords
 * using bcrypt, and creates a secure HTTP-only session cookie upon success.
 * All login attempts (success/failure) are logged for security auditing.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body containing credentials
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password
 * 
 * @returns {Promise<NextResponse>} JSON response with result
 * @returns {200} Success - Login successful, session cookie set
 * @returns {400} Bad Request - Missing email or password
 * @returns {401} Unauthorized - Invalid credentials
 * @returns {500} Server Error - Database or server error
 * 
 * @example
 * // Request
 * POST /api/login
 * { "email": "john@example.com", "password": "secret123" }
 * 
 * // Success Response (200)
 * { "message": "Login successful", "user": { "id": "...", "email": "...", "name": "...", "role": "..." } }
 */
export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            await logLoginFailed(email, 'User not found');
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            await logLoginFailed(email, 'Invalid password');
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        // Set the userId cookie for authentication
        cookies().set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_COOKIE_MAX_AGE,
            path: '/',
        });

        // Log successful login
        await logLogin(user.id, user.email);

        return NextResponse.json({ 
            message: 'Login successful', 
            user: { id: user.id, email: user.email, name: user.name, role: user.role } 
        }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }

}