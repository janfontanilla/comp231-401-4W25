"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { TaskCompletionChart } from "./_components/task-completion-chart";
import { ExportButtons } from "./_components/export-buttons";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportsData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalCards: number;
    cardsCreatedInRange: number;
    boardsCreated: number;
    completionRate: number;
  };
  activityByType: Array<{ type: string; count: number }>;
  activityByAction: Array<{ action: string; count: number }>;
  userActivity: Array<{
    userId: string;
    userName: string;
    activityCount: number;
  }>;
}

export default function ReportsPage() {
  const { data, isLoading, error } = useQuery<ReportsData>({
    queryKey: ["admin-reports"],
    queryFn: () => fetcher("/api/admin/reports"),
  });

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Performance Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and export performance reports
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-destructive">
            Error loading reports. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and export performance reports
          </p>
        </div>
        {data && (
          <ExportButtons
            startDate={data.dateRange.startDate}
            endDate={data.dateRange.endDate}
          />
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Summary */}
          {data && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{data.stats.totalCards}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Cards Created (Range)
                </p>
                <p className="text-2xl font-bold">
                  {data.stats.cardsCreatedInRange}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Boards Created (Range)
                </p>
                <p className="text-2xl font-bold">
                  {data.stats.boardsCreated}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">
                  {data.stats.completionRate}%
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="rounded-lg border bg-card p-6">
            <TaskCompletionChart
              data={
                data
                  ? {
                      activityByType: data.activityByType,
                      activityByAction: data.activityByAction,
                    }
                  : null
              }
            />
          </div>

          {/* User Activity */}
          {data && data.userActivity.length > 0 && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Top Active Users</h3>
              <div className="space-y-2">
                {data.userActivity.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted"
                  >
                    <span className="text-sm">{user.userName}</span>
                    <span className="text-sm font-medium">
                      {user.activityCount} actions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

