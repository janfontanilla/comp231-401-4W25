"use client";

import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DueDateProps {
  data: CardWithList;
}

/**
 * Convert a Date to the value format expected by <input type="datetime-local">
 * (YYYY-MM-DDTHH:mm) in local time.
 */
function toInputValue(date: Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const DueDate = ({ data }: DueDateProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(toInputValue(data.dueDate));

  const { execute, isLoading } = useAction(updateCard, {
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["card", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", updated.id] });
      toast.success("Due date updated");
    },
    onError: (error) => toast.error(error),
  });

  const save = (dueDate: Date | null) => {
    execute({
      id: data.id,
      boardId: params.boardId as string,
      dueDate,
    });
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <Clock className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">Due date</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            value={value}
            disabled={isLoading}
            onChange={(e) => setValue(e.target.value)}
            className="text-sm bg-neutral-200 rounded-md px-3 py-2 border-transparent focus-visible:bg-white focus-visible:border-input outline-none"
          />
          <Button
            type="button"
            size="sm"
            disabled={isLoading || !value}
            onClick={() => save(value ? new Date(value) : null)}
          >
            Save
          </Button>
          {data.dueDate && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isLoading}
              onClick={() => {
                setValue("");
                save(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

DueDate.Skeleton = function DueDateSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-48 h-10 bg-neutral-200" />
      </div>
    </div>
  );
};
