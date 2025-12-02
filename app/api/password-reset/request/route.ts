import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new token
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // In production, you would send an email here
    // For now, we'll just return the token in development
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    console.log('Password reset link:', resetLink);

    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
      // Only include resetLink in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    });
  } catch (error) {
    console.error('[PASSWORD_RESET_REQUEST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

