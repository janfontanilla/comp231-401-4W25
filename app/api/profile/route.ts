import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

import { db } from "@/lib/db";

export async function GET() {
    try {
        const userId = cookies().get("userId");

        const user = await db.user.findUnique({
            where: {
                id: userId?.value,
            },
        });

        return NextResponse.json(user);

    } catch (error) {
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