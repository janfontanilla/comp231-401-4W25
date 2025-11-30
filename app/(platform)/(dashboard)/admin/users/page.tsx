"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { UserTable } from "./_components/user-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => fetcher("/api/admin/users"),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage system users and permissions
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-destructive">
            Error loading users. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system users and permissions
        </p>
      </div>

      <UserTable users={users || null} isLoading={isLoading} onRefresh={handleRefresh} />
    </div>
  );
}

