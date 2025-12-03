"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Activity, CreditCard, Layout } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type Organization = {
  id: string;
  slug: string;
  imageUrl: string;
  name: string;
};

interface NavItemProps {
  isExpanded: boolean;
  isActive: boolean;
  organization: Organization;
  onExpand: (id: string) => void;
}

export const NavItem = ({
  isExpanded,
  isActive,
  organization,
  onExpand,
}: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("user"); // Default to "user"
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Always try to fetch profile - server can read httpOnly cookie
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          console.log('[NavItem] Profile data:', data);
          console.log('[NavItem] User role:', data?.role);
          setUserRole(data?.role || "user");
        } else {
          // Not authenticated or error - treat as guest
          console.log('[NavItem] Not authenticated, setting role to guest');
          setUserRole("guest");
        }
      } catch (error) {
        console.error('[NavItem] Error fetching role:', error);
        setUserRole("guest");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  // Define routes with role restrictions
  const allRoutes = [
    {
      label: "Boards",
      icon: <Layout className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}`,
      roles: ["admin", "user"], // Only authenticated users can see boards
    },
    {
      label: "Activity",
      icon: <Activity className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/activity`,
      roles: ["admin", "user"], // Only admin and core users - NO guests
    },
    {
      label: "Billing",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/billing`,
      roles: ["admin"], // Only admin
    },
  ];

  // Filter routes based on user role - show all while loading, then filter
  const routes = isLoading 
    ? allRoutes.filter(route => route.roles.includes("user")) // Show user routes while loading
    : allRoutes.filter(route => route.roles.includes(userRole));

  console.log('[NavItem] Current role:', userRole, 'Loading:', isLoading, 'Routes:', routes.map(r => r.label));

  const onClick = (href: string) => {
    router.push(href);
  };

  return (
    <AccordionItem value={organization.id} className="border-none">
      <AccordionTrigger
        onClick={() => onExpand(organization.id)}
        className={cn(
          "flex items-center gap-x-2 p-1.5 text-neutral-700 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
          isActive && !isExpanded && "bg-sky-500/10 text-sky-700"
        )}
      >
        <div className="flex items-center gap-x-2">
          <div className="w-7 h-7 relative">
            <Image
              fill
              src={organization.imageUrl}
              alt="Organization"
              className="rounded-sm object-cover"
            />
          </div>
          <span className="font-medium text-sm">{organization.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 text-neutral-700">
        {routes.map((route) => (
          <Button
            key={route.href}
            size="sm"
            onClick={() => onClick(route.href)}
            className={cn(
              "w-full font-normal justify-start pl-10 mb-1",
              pathname === route.href && "bg-sky-500/10 text-sky-700"
            )}
            variant="ghost"
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="w-10 h-10 relative shrink-0">
        <Skeleton className="h-full w-full absolute" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
