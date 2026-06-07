import { db } from '@/lib/db';
import { sendDeadlineEmail } from '@/lib/email';

export type NotificationType = 'deadline' | 'assignment' | 'system' | 'question';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, link } = params;

  try {
    // Check user's notification preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        notifyInApp: true,
        notifyDeadlines: true,
        notifyAssignments: true,
      },
    });

    if (!user) return null;

    // Check if user wants this type of notification
    if (!user.notifyInApp) return null;
    if (type === 'deadline' && !user.notifyDeadlines) return null;
    if (type === 'assignment' && !user.notifyAssignments) return null;

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    return notification;
  } catch (error) {
    console.error('[CREATE_NOTIFICATION_ERROR]', error);
    return null;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const results = await Promise.all(
    userIds.map((userId) => createNotification({ ...params, userId }))
  );
  return results.filter(Boolean);
}

/**
 * Check for upcoming deadlines and create notifications
 */
export async function checkDeadlines() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  try {
    // Find cards with deadlines in the next 24 hours that haven't been notified
    const upcomingCards = await db.card.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: in24Hours,
        },
        assignedToId: { not: null },
      },
      include: {
        assignedTo: true,
        list: {
          include: { board: true },
        },
      },
    });

    const notifications = [];
    let emailsSent = 0;

    for (const card of upcomingCards) {
      if (!card.assignedTo || !card.dueDate) continue;

      const hoursUntilDue = Math.round(
        (card.dueDate.getTime() - now.getTime()) / (60 * 60 * 1000)
      );

      let title: string;
      let message: string;

      if (hoursUntilDue <= 1) {
        title = '⚠️ Task Due Soon!';
        message = `"${card.title}" is due in less than 1 hour`;
      } else if (hoursUntilDue <= 4) {
        title = '🔔 Task Deadline Approaching';
        message = `"${card.title}" is due in ${hoursUntilDue} hours`;
      } else {
        title = '📅 Upcoming Deadline';
        message = `"${card.title}" is due in ${hoursUntilDue} hours`;
      }

      const boardLink = `/board/${card.list.board.id}`;

      const notification = await createNotification({
        userId: card.assignedTo.id,
        type: 'deadline',
        title,
        message,
        link: boardLink,
      });

      if (notification) {
        notifications.push(notification);
      }

      // Send a deadline reminder email once per due date (deduped via notifiedAt).
      const user = card.assignedTo;
      if (
        !card.notifiedAt &&
        user.email &&
        user.notifyEmail &&
        user.notifyDeadlines
      ) {
        const sent = await sendDeadlineEmail({
          to: user.email,
          cardTitle: card.title,
          dueDate: card.dueDate,
          link: `${appUrl}${boardLink}`,
        });

        if (sent) {
          emailsSent += 1;
          // Stamp the card so we don't email again for this deadline.
          await db.card.update({
            where: { id: card.id },
            data: { notifiedAt: now },
          });
        }
      }
    }

    return {
      checked: upcomingCards.length,
      notified: notifications.length,
      emailsSent,
    };
  } catch (error) {
    console.error('[CHECK_DEADLINES_ERROR]', error);
    return { checked: 0, notified: 0, emailsSent: 0, error: String(error) };
  }
}

/**
 * Notify user when assigned to a task
 */
export async function notifyTaskAssignment(
  userId: string,
  cardTitle: string,
  boardId: string,
  assignedByName: string
) {
  return createNotification({
    userId,
    type: 'assignment',
    title: '📋 New Task Assigned',
    message: `${assignedByName} assigned you to "${cardTitle}"`,
    link: `/board/${boardId}`,
  });
}

