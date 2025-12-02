"use client";

import { ShieldX, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredRole?: string;
}

export const AccessDenied = ({
  title = "Access Restricted",
  message = "You don't have permission to view this page.",
  requiredRole = "Admin",
}: AccessDeniedProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <ShieldX className="h-12 w-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md mb-2">{message}</p>
      <p className="text-sm text-muted-foreground mb-6">
        Required role: <span className="font-semibold text-purple-600">{requiredRole}</span>
      </p>
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>
    </div>
  );
};

