import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Validate invite token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token required' }, { status: 400 });
    }

    const invite = await db.guestInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ valid: false, error: 'Invalid invite link' });
    }

    if (!invite.isActive) {
      return NextResponse.json({ valid: false, error: 'This invite has been revoked' });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ valid: false, error: 'This invite has expired' });
    }

    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json({ valid: false, error: 'This invite has reached its usage limit' });
    }

    return NextResponse.json({
      valid: true,
      invite: {
        id: invite.id,
        boardId: invite.boardId,
        expiresAt: invite.expiresAt,
        remainingUses: invite.maxUses - invite.usedCount,
      },
    });
  } catch (error) {
    console.error('[INVITE_VALIDATE_ERROR]', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate invite' }, { status: 500 });
  }
}

// POST - Use the invite (increment usage count)
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    const invite = await db.guestInvite.findUnique({
      where: { token },
    });

    if (!invite || !invite.isActive || new Date() > invite.expiresAt || invite.usedCount >= invite.maxUses) {
      return NextResponse.json({ success: false, error: 'Invalid or expired invite' }, { status: 400 });
    }

    // Increment usage count
    await db.guestInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      boardId: invite.boardId,
      message: 'Welcome! You now have guest access.',
    });
  } catch (error) {
    console.error('[INVITE_USE_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to use invite' }, { status: 500 });
  }
}

