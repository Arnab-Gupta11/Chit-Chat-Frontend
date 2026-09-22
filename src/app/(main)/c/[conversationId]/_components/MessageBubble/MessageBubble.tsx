"use client";
import {
  Check,
  CheckCheck,
  MoreHorizontal,
  Reply,
  Smile,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { setEditingMessage } from "@/redux/features/chatUi/chatUiSlice";
import { getSocket } from "@/lib/socket";
import { SocketEvent } from "@/constants/socketEvents";
import { useParams } from "next/navigation";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    timestamp: string;
    status?: string;
    isEdited?: boolean;
    isDeleted?: boolean;
  };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const handleDelete = async () => {
    const socket = await getSocket("/");
    socket.emit(SocketEvent.DELETE_MESSAGE, {
      messageId: message.id,
      conversationId: conversationId,
    });
  };

  return (
    <div
      className={`flex flex-col group ${isOwn ? "items-end" : "items-start"}`}
    >
      <div
        className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`p-3 rounded-2xl relative group ${isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"} ${message.isDeleted ? "opacity-75 italic" : ""}`}
        >
          {/* 🪄 মেসেজ কন্টেন্ট: ডিলিট হলে Ban আইকন দেখাবে */}
          <p className="text-sm flex items-center gap-1">
            {message.isDeleted && <Ban className="w-4 h-4 opacity-75" />}
            {message.content}
          </p>

          <div
            className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}
          >
            {message.isEdited && !message.isDeleted && (
              <span className="mr-1 italic opacity-75">(edited)</span>
            )}
            <span>{message.timestamp}</span>
            {isOwn && message.status === "sent" && (
              <Check className="w-3 h-3" />
            )}
            {isOwn && message.status === "delivered" && (
              <CheckCheck className="w-3 h-3" />
            )}
            {isOwn && message.status === "read" && (
              <CheckCheck className="w-3 h-3 text-blue-400" />
            )}
          </div>

          {/* Quick actions on hover (শুধু মেসেজ ডিলিট না হলেই এগুলো দেখাবে) */}
          {!message.isDeleted && (
            <div
              className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-background text-foreground border shadow-sm rounded-md ${isOwn ? "left-0 -translate-x-full -ml-2" : "right-0 translate-x-full ml-2"}`}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Smile className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Reply className="w-3 h-3" />
              </Button>

              <DeleteConfirmDialog onConfirm={handleDelete}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                      className: "h-6 w-6",
                    })}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Copy</DropdownMenuItem>
                    <DropdownMenuItem>Reply</DropdownMenuItem>
                    {isOwn && (
                      <DropdownMenuItem
                        onClick={() =>
                          dispatch(
                            setEditingMessage({
                              id: message.id,
                              content: message.content,
                            }),
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isOwn && (
                      <AlertDialogTrigger
                        nativeButton={false}
                        render={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        }
                      />
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </DeleteConfirmDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
