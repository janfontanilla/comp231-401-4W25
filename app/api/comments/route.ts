/**
 * @fileoverview Comments API Route
 * @description Handles posting and retrieving comments/questions on boards
 * @author Ryan Massey
 */

import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { cookies } from 'next/headers';

/**
 * POST /api/comments - Create a new comment on a board
 * 
 * @description Allows authenticated users to post comments/questions on boards
 * for team collaboration. The comment is associated with the user's name and the board.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body
 * @param {string} request.body.comment - The comment text content
 * @param {string} request.body.boardId - ID of the board to comment on
 * 
 * @returns {Promise<NextResponse>} JSON response
 * @returns {201} Success - Comment created
 * @returns {500} Server Error - Database error
 * 
 * @example
 * // Request
 * POST /api/comments
 * { "comment": "What's the deadline for this task?", "boardId": "board-123" }
 * 
 * // Success Response (201)
 * { "message": "Comment added" }
 */
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

/**
 * GET /api/comments - Retrieve comments for a board
 * 
 * @description Fetches all comments for a specific board. If no boardId is provided,
 * returns all comments in the system.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {string} [request.query.boardId] - Optional board ID to filter comments
 * 
 * @returns {Promise<NextResponse>} JSON array of comments
 * @returns {200} Success - Returns array of comment objects
 * @returns {500} Server Error - Database error
 * 
 * @example
 * // Request
 * GET /api/comments?boardId=board-123
 * 
 * // Response (200)
 * [{ "id": "...", "text": "...", "name": "John", "boardId": "...", "createdAt": "..." }]
 */
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