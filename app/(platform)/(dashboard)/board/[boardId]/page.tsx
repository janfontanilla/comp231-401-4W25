import { db } from "@/lib/db";
import { DEFAULT_ORG_ID } from "@/lib/constants";

import { ListContainer } from "./_components/list-container";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const lists = await db.list.findMany({
    where: {
      boardId: params.boardId,
      board: {
        orgId: DEFAULT_ORG_ID,
      },
    },
    include: {
      cards: {
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={params.boardId} data={lists} />
    </div>
  );
};

export default BoardIdPage;
