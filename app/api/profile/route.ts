import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

import { db } from "@/lib/db";

export async function GET() {
    try {
        const userId = cookies().get("userId");

        if (!userId?.value) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: {
                id: userId.value,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Log for debugging
        console.log('[PROFILE_GET] User:', user.email, 'Role:', user.role);

        return NextResponse.json(user);

    } catch (error) {
        console.error('[PROFILE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const { password } = await request.json();

    const userId = cookies().get("userId");

    try {
        const user = await db.user.findUnique({
            where: {
                id: userId?.value,
            },
        });
        if (!user) {
            return NextResponse.json({ message: 'User could not be found' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.update({
            where: {
                id: userId?.value,
            },
            data: {
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: hashedPassword }, { status: 200 });
    } catch (error) {
        console.error('User error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}