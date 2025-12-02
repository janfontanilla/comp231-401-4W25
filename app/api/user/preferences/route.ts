import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Get user's notification preferences
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await db.user.findUnique({
      where: { id: user.id },
      select: {
        notifyEmail: true,
        notifyInApp: true,
        notifyDeadlines: true,
        notifyAssignments: true,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('[PREFERENCES_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// PATCH - Update user's notification preferences
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notifyEmail, notifyInApp, notifyDeadlines, notifyAssignments } = body;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(typeof notifyEmail === 'boolean' && { notifyEmail }),
        ...(typeof notifyInApp === 'boolean' && { notifyInApp }),
        ...(typeof notifyDeadlines === 'boolean' && { notifyDeadlines }),
        ...(typeof notifyAssignments === 'boolean' && { notifyAssignments }),
      },
      select: {
        notifyEmail: true,
        notifyInApp: true,
        notifyDeadlines: true,
        notifyAssignments: true,
      },
    });

    return NextResponse.json({
      message: 'Preferences updated',
      preferences: updatedUser,
    });
  } catch (error) {
    console.error('[PREFERENCES_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

