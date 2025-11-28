import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const { comment, boardId } = await request.json();
    const userId = cookies().get("userId");

    const user = await db.user.findUnique({
        where: {
            id: userId?.value,
        },
    });

    try {
        const savedComment = await db.comment.create({
            data: {
                text: comment,
                name: user?.name || "Unknown",
                boardId: boardId,
            },
        });
        return NextResponse.json({ message: 'Comment added' }, { status: 201 });
    } catch (error) {
        console.error('Comment error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    try {
        const comments = await db.comment.findMany({
            where: {
                boardId: boardId || undefined,
            }
        });

        return NextResponse.json(comments);

    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}