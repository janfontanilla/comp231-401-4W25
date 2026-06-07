"use client";

import { toast } from "sonner";
import { Paperclip, Trash2, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface AttachmentsProps {
  data: CardWithList;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const Attachments = ({ data }: AttachmentsProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const attachments = data.attachments ?? [];

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["card", data.id] });

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/cards/${data.id}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }

      toast.success(`Attached "${file.name}"`);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDelete = async (attachmentId: string, name: string) => {
    setDeletingId(attachmentId);
    try {
      const res = await fetch(
        `/api/cards/${data.id}/attachments/${attachmentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Removed "${name}"`);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <Paperclip className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-neutral-700">Attachments</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              "Add file"
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onUpload}
          />
        </div>

        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files attached yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {attachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center justify-between gap-x-2 bg-neutral-200 rounded-md px-3 py-2"
              >
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 min-w-0 hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0 text-neutral-600" />
                  <span className="text-sm font-medium truncate">
                    {att.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatBytes(att.bytes)}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => onDelete(att.id, att.name)}
                  disabled={deletingId === att.id}
                  className="text-neutral-500 hover:text-red-600 disabled:opacity-50 shrink-0"
                  aria-label={`Delete ${att.name}`}
                >
                  {deletingId === att.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Attachments.Skeleton = function AttachmentsSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-10 bg-neutral-200" />
      </div>
    </div>
  );
};
