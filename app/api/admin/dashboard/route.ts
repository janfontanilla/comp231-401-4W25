/**
 * @fileoverview Admin Dashboard API Route
 * @description Provides aggregated statistics and metrics for admin users
 * @author Jan Rafael
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_ORG_ID, RECENT_ACTIVITY_LIMIT, ACTIVE_USER_THRESHOLD_DAYS } from '@/lib/constants';

/**
 * GET /api/admin/dashboard - Retrieve admin dashboard statistics
 * 
 * @description Fetches aggregated metrics for the admin dashboard including:
 * - Total boards, cards, users, and lists counts
 * - Completion rate (cards in Done/Complete/Finished lists)
 * - Boards created this month
 * - Active users (users with recent audit log activity)
 * - Recent activity log entries
 * 
 * @algorithm Completion Rate Calculation:
 * completionRate = (completedCards / totalCards) * 100
 * where completedCards = cards in lists containing "Done", "Complete", or "Finished"
 * 
 * @requires Admin authentication (role = 'admin')
 * 
 * @returns {Promise<NextResponse>} JSON response with dashboard data
 * @returns {200} Success - Returns stats object and recentActivity array
 * @returns {403} Forbidden - User is not admin
 * @returns {500} Server Error - Database error
 * 
 * @example
 * // Response (200)
 * {
 *   "stats": { "totalBoards": 5, "totalCards": 25, "totalUsers": 10, "completionRate": 40, ... },
 *   "recentActivity": [...]
 * }
 */
export async function GET() {
  try {
    // Check if user is admin
    await requireAdmin();

    // Get total counts
    const [totalBoards, totalCards, totalUsers, totalLists, completedCards] = await Promise.all([
      db.board.count({
        where: { orgId: DEFAULT_ORG_ID }
      }),
      db.card.count({
        where: {
          list: {
            board: {
              orgId: DEFAULT_ORG_ID
            }
          }
        }
      }),
      db.user.count(),
      db.list.count({
        where: {
          board: {
            orgId: DEFAULT_ORG_ID
          }
        }
      }),
      // Count cards in lists that indicate completion (Done, Complete, Completed, Finished)
      db.card.count({
        where: {
          list: {
            OR: [
              { title: { contains: 'Done' } },
              { title: { contains: 'Complete' } },
              { title: { contains: 'Finished' } },
            ],
            board: {
              orgId: DEFAULT_ORG_ID
            }
          }
        }
      })
    ]);

    // Get recent activity
    const recentActivity = await db.auditLog.findMany({
      where: {
        orgId: DEFAULT_ORG_ID
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: RECENT_ACTIVITY_LIMIT
    });

    // Calculate completion rate based on cards in "Done/Complete/Finished" lists
    const completionRate = totalCards > 0 
      ? Math.round((completedCards / totalCards) * 100)
      : 0;

    // Get boards created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const boardsThisMonth = await db.board.count({
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Get active users (users who have created audit logs recently)
    const activeThresholdDate = new Date();
    activeThresholdDate.setDate(activeThresholdDate.getDate() - ACTIVE_USER_THRESHOLD_DAYS);

    const activeUserIds = await db.auditLog.findMany({
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: activeThresholdDate
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });

    const activeUsers = activeUserIds.length;

    return NextResponse.json({
      stats: {
        totalBoards,
        totalCards,
        totalUsers,
        totalLists,
        completionRate,
        boardsThisMonth,
        activeUsers
      },
      recentActivity
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_ERROR]', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

