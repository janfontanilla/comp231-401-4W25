/**
 * @fileoverview Guest Feedback API Route
 * @description Handles guest feedback submission and retrieval
 * @author Saeed Herzi
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/guest/feedback - Retrieve all feedback entries (Admin only)
 * 
 * @description Fetches all guest feedback submissions, ordered by most recent.
 * Only accessible by admin users.
 * 
 * @requires Admin authentication
 * 
 * @returns {Promise<NextResponse>} JSON array of feedback entries
 * @returns {200} Success - Array of feedback objects
 * @returns {403} Forbidden - Non-admin access attempt
 * @returns {500} Server Error - Database error
 */
export async function GET() {
  try {
    await requireAdmin();

    const feedback = await db.guestFeedback.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

/**
 * POST /api/guest/feedback - Submit guest feedback
 * 
 * @description Allows guests to submit feedback about projects. No authentication required.
 * Validates that name and feedback text are provided, and rating is 1-5 if included.
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body
 * @param {string} request.body.guestName - Name of the guest (required)
 * @param {string} [request.body.guestEmail] - Optional email address
 * @param {string} [request.body.boardId] - Optional board ID
 * @param {string} request.body.feedback - Feedback text (required)
 * @param {number} [request.body.rating] - Optional rating 1-5
 * 
 * @returns {Promise<NextResponse>} JSON response
 * @returns {201} Success - Feedback saved
 * @returns {400} Bad Request - Missing required fields or invalid rating
 * @returns {500} Server Error - Database error
 * 
 * @example
 * // Request
 * POST /api/guest/feedback
 * { "guestName": "John", "feedback": "Great project!", "rating": 5 }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, guestEmail, boardId, feedback, rating } = body;

    if (!guestName || !feedback) {
      return NextResponse.json(
        { error: 'Name and feedback are required' },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const newFeedback = await db.guestFeedback.create({
      data: {
        guestName,
        guestEmail: guestEmail || null,
        boardId: boardId || null,
        feedback,
        rating: rating || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: newFeedback.id,
    }, { status: 201 });
  } catch (error) {
    console.error('[FEEDBACK_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

/**
 * PATCH /api/guest/feedback - Update feedback status (Admin only)
 * 
 * @description Updates the status of a feedback entry. Status can be:
 * 'pending', 'reviewed', or 'resolved'. Only accessible by admin users.
 * 
 * @requires Admin authentication
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body
 * @param {string} request.body.id - Feedback entry ID
 * @param {string} request.body.status - New status ('pending'|'reviewed'|'resolved')
 * 
 * @returns {Promise<NextResponse>} JSON response
 * @returns {200} Success - Updated feedback object
 * @returns {400} Bad Request - Missing ID/status or invalid status
 * @returns {403} Forbidden - Non-admin access attempt
 * @returns {500} Server Error - Database error
 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await db.guestFeedback.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

