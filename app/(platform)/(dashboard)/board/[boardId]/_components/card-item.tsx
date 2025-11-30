"use client";

import { Card, User } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

import { useCardModal } from "@/hooks/use-card-modal";

interface CardItemProps {
  data: Card & {
    assignedTo?: User | null;
  };
  index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="truncate border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate flex-1">{data.title}</span>
            {data.assignedTo && (
              <div className="flex-shrink-0" title={data.assignedTo.name}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-purple-600" />
                  </div>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
