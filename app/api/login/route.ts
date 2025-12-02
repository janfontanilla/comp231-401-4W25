import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_MAX_AGE } from '@/lib/constants';
import { logLogin, logLoginFailed } from '@/lib/access-log';

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