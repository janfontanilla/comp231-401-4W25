"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { DEFAULT_ORG_ID } from "@/lib/constants";

import { NavItem } from "./nav-item";

interface SidebarProps {
  storageKey?: string;
}

export const Sidebar = ({ storageKey = "t-sidebar-state" }: SidebarProps) => {
  const pathname = usePathname();
  const isActive = pathname?.includes(DEFAULT_ORG_ID);
  const isAdminActive = pathname?.startsWith('/admin');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin - always try API since cookie is httpOnly
    const checkAdmin = async () => {
      try {
        console.log('[Sidebar] Fetching profile...');
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          console.log('[Sidebar] Profile response:', data);
          console.log('[Sidebar] User role:', data.role, 'Is admin:', data.role === 'admin');
          setIsAdmin(data.role === 'admin');
        } else {
          console.log('[Sidebar] Not authenticated or error:', response.status);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('[Sidebar] Error fetching profile:', error);
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <>
      <div className="font-medium text-xs flex items-center mb-1">
        <span className="pl-4">Workspace</span>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[DEFAULT_ORG_ID]}
        className="space-y-2"
      >
        <NavItem
          isActive={isActive}
          isExpanded={true}
          organization={{
            id: DEFAULT_ORG_ID,
            name: "MyTracker Workspace",
            slug: "default",
            imageUrl: "",
          }}
          onExpand={() => {}}
        />
      </Accordion>
      {isAdmin && (
        <div className="mt-4 pt-4 border-t">
          <div className="font-medium text-xs flex items-center mb-1">
            <span className="pl-4">Administration</span>
          </div>
          <Link
            href="/admin"
            className={`flex items-center gap-x-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
              isAdminActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </div>
      )}
    </>
  );
};
