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
    reactions?: any[];
  };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const conversationId = params.conversationId as string;

  //Delete Message
  const handleDelete = async () => {
    const socket = await getSocket("/");
    socket.emit(SocketEvent.DELETE_MESSAGE, {
      messageId: message.id,
      conversationId: conversationId,
    });
  };

  //Toggle Reaction
  const handleToggleReaction = async (emoji: string) => {
    const socket = await getSocket("/");

    socket.emit(SocketEvent.TOGGLE_REACTION, {
      messageId: message.id,
      conversationId: conversationId,
      emoji: emoji,
    });
  };

  //Group reaction if one reaction added multiple time
  const reactionGroups = message.reactions?.reduce((acc: any, curr: any) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

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
          <div className="text-sm flex items-center gap-1">
            {message.isDeleted && <Ban className="w-4 h-4 opacity-75" />}
            {message.content}
            {message.reactions && message.reactions.length > 0 && (
              <div
                className={`absolute -bottom-3 ${isOwn ? "right-2" : "left-2"} flex gap-1 bg-background border shadow-sm rounded-full px-1.5 py-0.5 text-[10px]`}
              >
                {Object.entries(reactionGroups || {}).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    className="flex items-center gap-0.5 text-foreground"
                  >
                    {emoji}{" "}
                    <span className="font-semibold text-muted-foreground">
                      {(count as number) > 1 ? (count as number) : ""}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

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
              {/* 🪄 Emoji Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "h-6 w-6",
                  })}
                >
                  <Smile className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex gap-1 min-w-0 p-1"
                  style={{ width: "max-content", flexDirection: "row" }}
                >
                  {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                    <DropdownMenuItem
                      key={emoji}
                      onClick={() => handleToggleReaction(emoji)}
                      className="cursor-pointer px-2 py-1 text-base hover:bg-muted"
                    >
                      {emoji}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
