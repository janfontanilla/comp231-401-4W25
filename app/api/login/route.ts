import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }

}