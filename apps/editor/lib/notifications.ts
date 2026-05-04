import { prisma } from "@/lib/prisma";
import type { NotificationType, Notification } from "@/prisma/generated-client";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  meta?: Record<string, unknown>;
}

/**
 * Persists a notification for a user.
 * Does NOT swallow errors — callers should handle with .catch() if fire-and-forget is desired.
 */
export async function createNotification({
  userId,
  type,
  meta,
}: CreateNotificationParams): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      meta: meta ?? {},
    },
  });
}

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

/**
 * Returns the most recent notifications for a user, ordered by creation time descending.
 */
export async function getRecentNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Marks all unread notifications for a user as read.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
