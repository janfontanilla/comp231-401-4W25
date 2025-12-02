"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserSelectorProps {
  value?: string;
  onChange: (userId: string | null) => void;
  placeholder?: string;
}

export const UserSelector = ({
  value,
  onChange,
  placeholder = "Select team member...",
}: UserSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => fetcher("/api/admin/users"),
  });

  const selectedUser = users?.find((u) => u.id === value);

  // Filter users by search
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium flex items-center gap-1">
        <UserIcon className="h-4 w-4" />
        Assigned To
      </label>
      <div className="relative">
        {/* Selected user display / Trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                <UserIcon className="h-3 w-3 text-purple-600" />
              </div>
              <span>{selectedUser.name}</span>
              {selectedUser.role === "admin" && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selectedUser && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="h-5 w-5 rounded-full hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* User list */}
            <div className="max-h-48 overflow-y-auto">
              {/* Unassigned option */}
              <div
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  !value ? "bg-blue-50" : ""
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="h-3 w-3 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">Unassigned</span>
                {!value && <Check className="h-4 w-4 text-blue-500 ml-auto" />}
              </div>

              {filteredUsers?.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onChange(user.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    value === user.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      {user.role === "admin" && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex-shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {value === user.id && (
                    <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              ))}

              {filteredUsers?.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">
                  No users found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

