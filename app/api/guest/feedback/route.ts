import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET - List all feedback (admin only)
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

// POST - Submit feedback (anyone can submit)
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

// PATCH - Update feedback status (admin only)
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

