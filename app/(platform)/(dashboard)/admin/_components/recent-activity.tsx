"use client";

import { AuditLog } from "@prisma/client";
import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DEFAULT_ORG_ID } from "@/lib/constants";

interface RecentActivityProps {
  activity: AuditLog[] | null;
}

export const RecentActivity = ({ activity }: RecentActivityProps) => {
  if (!activity) {
    return <RecentActivity.Skeleton />;
  }

  if (activity.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No activity found
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link href={`/organization/${DEFAULT_ORG_ID}/activity`}>
          <Button variant="ghost" size="sm" className="h-8">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
      <ol className="space-y-4">
        {activity.map((log) => (
          <ActivityItem key={log.id} data={log} />
        ))}
      </ol>
    </div>
  );
};

RecentActivity.Skeleton = function RecentActivitySkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <ol className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex items-center gap-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

