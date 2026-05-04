import { prisma } from "@/lib/prisma";
import type { AuditEventType } from "@/prisma/generated-client";

export interface WriteAuditLogParams {
  teamId: string;
  actorId?: string;
  targetId?: string;
  event: AuditEventType;
  meta?: Record<string, unknown>;
}

/**
 * Persists a team audit log entry.
 * Does NOT swallow errors — callers should handle with .catch() if fire-and-forget is desired.
 */
export async function writeAuditLog({
  teamId,
  actorId,
  targetId,
  event,
  meta,
}: WriteAuditLogParams): Promise<void> {
  await prisma.teamAuditLog.create({
    data: {
      teamId,
      actorId: actorId ?? null,
      targetId: targetId ?? null,
      event,
      meta: meta ?? {},
    },
  });
}
