import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Shield, User, Eye } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Info } from "../_components/info";

import { ActivityList } from "./_components/activity-list";
import { checkSubscription } from "@/lib/subscription";
import { getCurrentUser } from "@/lib/auth";

const ActivityPage = async () => {
  const isPro = await checkSubscription();
  const user = await getCurrentUser();

  // Guest users (not logged in) are redirected
  if (!user) {
    redirect("/login?message=Please login to view activity");
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="w-full">
      <Info isPro={isPro} />
      <Separator className="my-2" />
      
      {/* Role-based header */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <span className="font-semibold text-purple-600">Admin View</span>
                <p className="text-xs text-muted-foreground">
                  Full project-wide activity and metrics
                </p>
              </div>
            </>
          ) : (
            <>
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-semibold text-blue-600">My Activity</span>
                <p className="text-xs text-muted-foreground">
                  Task-level activity relevant to your assignments
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={<ActivityList.Skeleton />}>
        <ActivityList userRole={user.role} userId={user.id} />
      </Suspense>
    </div>
  );
};

export default ActivityPage;
