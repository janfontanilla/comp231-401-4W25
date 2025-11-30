"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { DashboardStats } from "./_components/dashboard-stats";
import { RecentActivity } from "./_components/recent-activity";
import { AuditLog } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalBoards: number;
    totalCards: number;
    totalUsers: number;
    totalLists: number;
    completionRate: number;
    boardsThisMonth: number;
    activeUsers: number;
  };
  recentActivity: AuditLog[];
}

export default function AdminPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetcher("/api/admin/dashboard"),
  });

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of system metrics and project progress
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-destructive">
            Error loading dashboard. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of system metrics and project progress
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </>
        ) : (
          <>
            <DashboardStats stats={data?.stats || null} />
            <RecentActivity activity={data?.recentActivity || null} />
          </>
        )}
      </div>
    </div>
  );
}

