import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
        return NextResponse.json({ message: 'Email, password and name are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        return NextResponse.json({ message: 'Registration successful', user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}