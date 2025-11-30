import { cookies } from 'next/headers';
import { db } from '@/lib/db';

/**
 * Get the current authenticated user from the session cookie
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const userId = cookies().get("userId")?.value;
  
  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    return user;
  } catch (error) {
    console.error('[AUTH_ERROR]', error);
    return null;
  }
}

/**
 * Require that the current user is an admin
 * Throws an error if user is not authenticated or not an admin
 * @returns User object with admin role
 * @throws Error if user is not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return user;
}

