import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find the token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('[PASSWORD_RESET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token validity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid token' });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Token has expired' });
    }

    return NextResponse.json({ valid: true, email: resetToken.email });
  } catch (error) {
    console.error('[TOKEN_VERIFY_ERROR]', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

