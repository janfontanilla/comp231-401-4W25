"use client";

import { Layout, CheckSquare, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  stats: {
    totalBoards: number;
    totalCards: number;
    totalUsers: number;
    totalLists: number;
    completionRate: number;
    boardsThisMonth: number;
    activeUsers: number;
  } | null;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  if (!stats) {
    return <DashboardStats.Skeleton />;
  }

  const statCards = [
    {
      title: "Total Boards",
      value: stats.totalBoards,
      icon: Layout,
      description: "Active projects",
      color: "bg-blue-500",
    },
    {
      title: "Total Cards",
      value: stats.totalCards,
      icon: CheckSquare,
      description: "Tasks created",
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "bg-purple-500",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      description: "Task completion",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

DashboardStats.Skeleton = function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
};

