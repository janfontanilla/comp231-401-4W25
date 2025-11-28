import { Plus } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { MobileSidebar } from "./mobile-sidebar";
import { FormPopover } from "@/components/form/form-popover";

import { cookies } from "next/headers";

export const Navbar = () => {
  const userId = cookies().get("userId")?.value || "";

  return (
    <nav className="fixed z-50 top-0 px-4 w-full h-14 border-b shadow-sm bg-white flex justify-between items-center">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <div className="hidden md:flex">
          <Logo />
        </div>
        <FormPopover align="start" side="bottom" sideOffset={18}>
          <Button
            variant="primary"
            size="sm"
            className="rounded-sm hidden md:block h-auto  py-1.5 px-2"
          >
            Create
          </Button>
        </FormPopover>
        <FormPopover>
          <Button
            variant="primary"
            size="sm"
            className="rounded-sm block md:hidden"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </FormPopover>
      </div>
      <div>
        {userId == "" ?
          <Link href="/login" className="">
            Login
          </Link>
          :
          <Link href="/profile" className="">
            Profile
          </Link>
        }
      </div>
    </nav>
  );
};
