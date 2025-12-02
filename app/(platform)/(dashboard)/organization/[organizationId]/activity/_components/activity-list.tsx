import { db } from "@/lib/db";
import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_ORG_ID } from "@/lib/constants";

interface ActivityListProps {
  userRole?: string;
  userId?: string;
}

export const ActivityList = async ({ userRole = "user", userId }: ActivityListProps) => {
  const isAdmin = userRole === "admin";

  // Admin sees all activity; Core users see only their own activity
  const auditLogs = await db.auditLog.findMany({
    where: {
      orgId: DEFAULT_ORG_ID,
      // Core users only see their own activity
      ...(isAdmin ? {} : { userId: userId }),
    },
    orderBy: {
      createdAt: "desc",
    },
    // Limit for non-admin users
    take: isAdmin ? undefined : 50,
  });

  return (
    <div>
      {/* Activity count summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isAdmin ? (
            <span>Showing all <strong>{auditLogs.length}</strong> activities</span>
          ) : (
            <span>Showing <strong>{auditLogs.length}</strong> of your activities</span>
          )}
        </p>
        {!isAdmin && auditLogs.length === 50 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Limited to last 50 activities
          </span>
        )}
      </div>

      <ol className="space-y-4">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isAdmin 
                ? "No activity found in this organization" 
                : "No activity found for your account"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin 
                ? "Activity will appear here when users make changes" 
                : "Your activity will appear here when you create or modify items"}
            </p>
          </div>
        ) : (
          auditLogs.map((log) => (
            <ActivityItem key={log.id} data={log} />
          ))
        )}
      </ol>
    </div>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[75%] h-14" />
    </ol>
  );
};
