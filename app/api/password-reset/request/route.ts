/**
 * @fileoverview Password Reset Request API Route
 * @description Handles password reset token generation
 * @author Ryan Massey
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/password-reset/request - Request password reset token
 * 
 * @description Generates a cryptographically secure reset token using Node.js crypto.
 * Token is stored in database with 1-hour expiration. For security, always returns
 * success message regardless of whether email exists (prevents email enumeration attacks).
 * 
 * @algorithm Token Generation:
 * - Uses crypto.randomBytes(32) for 256 bits of cryptographic randomness
 * - Converts to 64-character hexadecimal string
 * - Expires after 1 hour (3600000 milliseconds)
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - JSON body
 * @param {string} request.body.email - User's email address
 * 
 * @returns {Promise<NextResponse>} JSON response
 * @returns {200} Success message (always, for security)
 * @returns {400} Bad Request - Email not provided
 * @returns {500} Server Error - Database error
 * 
 * @example
 * // Request
 * POST /api/password-reset/request
 * { "email": "john@example.com" }
 * 
 * // Response (200) - Always returns this for security
 * { "message": "If an account exists with this email, a reset link has been sent." }
 */
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

    /**
     * Generate cryptographically secure token
     * Algorithm: crypto.randomBytes generates 32 bytes (256 bits) of random data
     * Output: 64-character hexadecimal string
     */
    const token = crypto.randomBytes(32).toString('hex');
    /** Token expires in 1 hour (60 minutes * 60 seconds * 1000 milliseconds) */
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

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

