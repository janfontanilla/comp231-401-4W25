"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, BarChart3, Layout, ChevronRight } from "lucide-react";
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

      {/* Admin Quick Links */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Link 
          href="/admin/users" 
          className="p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors flex items-center gap-3 group"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-500">Add, remove, manage users</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
        </Link>

        <Link 
          href="/admin/reports" 
          className="p-4 border rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors flex items-center gap-3 group"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Performance Reports</h3>
            <p className="text-sm text-gray-500">Charts & export CSV/PDF</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
        </Link>

        <Link 
          href="/organization/default-org" 
          className="p-4 border rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors flex items-center gap-3 group"
        >
          <div className="p-2 bg-purple-100 rounded-lg">
            <Layout className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Manage Boards</h3>
            <p className="text-sm text-gray-500">View & assign tasks</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
        </Link>
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
