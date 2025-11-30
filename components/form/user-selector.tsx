"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserSelectorProps {
  value?: string;
  onChange: (userId: string | null) => void;
  placeholder?: string;
}

export const UserSelector = ({
  value,
  onChange,
  placeholder = "Assign to user...",
}: UserSelectorProps) => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => fetcher("/api/admin/users"),
  });

  const selectedUser = users?.find((u) => u.id === value);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assigned To</label>
      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
      {selectedUser && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
          </Avatar>
          <span>{selectedUser.name}</span>
        </div>
      )}
    </div>
  );
};

