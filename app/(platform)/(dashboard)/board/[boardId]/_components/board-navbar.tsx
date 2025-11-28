import { Board } from "@prisma/client";

import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";

import { cookies } from 'next/headers';

interface BoardNavbarProps {
  data: Board;
}

export const BoardNavbar = async ({ data }: BoardNavbarProps) => {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value || "";

  return (
    <div className="w-full h-14 z-[40] bg-black/50 fixed top-14 flex items-center px-6 gap-x-4 text-white">
      <BoardTitleForm data={data} />
      <div className="ml-auto">
        {userId &&
          <BoardOptions id={data.id} />
        }
      </div>
    </div>
  );
};

