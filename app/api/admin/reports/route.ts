import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_ORG_ID, DEFAULT_DATE_RANGE_DAYS, TOP_USERS_LIMIT } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to configured date range if no dates provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000);

    // Get task completion stats
    const totalCards = await db.card.count({
      where: {
        list: {
          board: {
            orgId: DEFAULT_ORG_ID,
          },
        },
      },
    });

    const cardsCreatedInRange = await db.card.count({
      where: {
        list: {
          board: {
            orgId: DEFAULT_ORG_ID,
          },
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get activity by entity type
    const activityByType = await db.auditLog.groupBy({
      by: ['entityType'],
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get activity by action
    const activityByAction = await db.auditLog.groupBy({
      by: ['action'],
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get boards created in range
    const boardsCreated = await db.board.count({
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get user activity (users who created audit logs)
    const userActivity = await db.auditLog.groupBy({
      by: ['userId'],
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: TOP_USERS_LIMIT,
    });

    // Get user names for activity
    const userIds = userActivity.map((ua) => ua.userId);
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userActivityWithNames = userActivity.map((ua) => {
      const user = users.find((u) => u.id === ua.userId);
      return {
        userId: ua.userId,
        userName: user?.name || user?.email || 'Unknown',
        activityCount: ua._count.id,
      };
    });

    // Calculate completion rate (simplified - cards created vs total)
    const completionRate = totalCards > 0
      ? Math.round((cardsCreatedInRange / totalCards) * 100)
      : 0;

    return NextResponse.json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      stats: {
        totalCards,
        cardsCreatedInRange,
        boardsCreated,
        completionRate,
      },
      activityByType: activityByType.map((item) => ({
        type: item.entityType,
        count: item._count.id,
      })),
      activityByAction: activityByAction.map((item) => ({
        action: item.action,
        count: item._count.id,
      })),
      userActivity: userActivityWithNames,
    });
  } catch (error) {
    console.error('[ADMIN_REPORTS_ERROR]', error);

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

