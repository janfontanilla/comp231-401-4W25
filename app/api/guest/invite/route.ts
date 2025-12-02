import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

// GET - List all invites (admin only)
export async function GET() {
  try {
    await requireAdmin();

    const invites = await db.guestInvite.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}

// POST - Create new invite (admin only)
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    
    const { email, boardId, expiresInHours = 48, maxUses = 1 } = body;

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invite = await db.guestInvite.create({
      data: {
        token,
        email: email || null,
        boardId: boardId || null,
        createdBy: admin.id,
        expiresAt,
        maxUses,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/join?token=${token}`;

    return NextResponse.json({
      invite,
      inviteLink,
      message: 'Invite created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('[INVITE_CREATE_ERROR]', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

// DELETE - Revoke invite (admin only)
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
    }

    await db.guestInvite.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Invite revoked' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to delete invite' }, { status: 500 });
  }
}

