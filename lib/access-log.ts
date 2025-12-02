import { db } from '@/lib/db';
import { headers } from 'next/headers';

export type AccessAction = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'access_denied'
  | 'admin_access'
  | 'admin_denied'
  | 'guest_join'
  | 'password_reset'
  | 'unauthorized';

interface LogAccessParams {
  userId?: string | null;
  userEmail?: string | null;
  action: AccessAction;
  resource: string;
  success: boolean;
  message?: string;
}

/**
 * Log an access attempt to the database
 */
export async function logAccess(params: LogAccessParams) {
  const { userId, userEmail, action, resource, success, message } = params;

  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await db.accessLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        resource,
        ipAddress,
        userAgent,
        success,
        message: message || null,
      },
    });

    console.log(`[ACCESS_LOG] ${action} - ${resource} - ${success ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    // Don't throw - logging should not break the app
    console.error('[ACCESS_LOG_ERROR]', error);
  }
}

/**
 * Log a successful login
 */
export async function logLogin(userId: string, userEmail: string) {
  return logAccess({
    userId,
    userEmail,
    action: 'login',
    resource: '/api/login',
    success: true,
    message: 'User logged in successfully',
  });
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailed(email: string, reason: string) {
  return logAccess({
    userEmail: email,
    action: 'login_failed',
    resource: '/api/login',
    success: false,
    message: reason,
  });
}

/**
 * Log an unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  resource: string,
  userId?: string,
  userEmail?: string
) {
  return logAccess({
    userId,
    userEmail,
    action: 'access_denied',
    resource,
    success: false,
    message: 'Unauthorized access attempt',
  });
}

/**
 * Log admin access denied
 */
export async function logAdminDenied(
  resource: string,
  userId: string,
  userEmail: string
) {
  return logAccess({
    userId,
    userEmail,
    action: 'admin_denied',
    resource,
    success: false,
    message: 'Non-admin user attempted to access admin resource',
  });
}

