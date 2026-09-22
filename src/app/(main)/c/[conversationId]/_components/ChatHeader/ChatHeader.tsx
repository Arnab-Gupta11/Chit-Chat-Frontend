"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSocket } from "@/lib/socket";
import { useGetConversationsQuery } from "@/redux/features/conversation/conversation.api";
import { useAppSelector } from "@/redux/hooks";
import { attachTypingListener } from "@/redux/socket-listeners/typing.listeners";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface ChatHeaderProps {
  conversationId: string;
}

export function ChatHeader({ conversationId }: ChatHeaderProps) {
  const currentUser = useAppSelector((state) => state.auth.user);

  // 🪄 আমরা নতুন করে API কল করছি না! Redux এর ক্যাশ থেকেই সাইডবারের ডেটাটি নিয়ে আসছি
  const { data } = useGetConversationsQuery();
  const conversation = data?.data?.conversations.find(
    (c) => c._id === conversationId,
  );

  // Typing Listener
  const [typingUser, setTypingUser] = useState<string | null>(null);
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    getSocket("/").then((socket) => {
      cleanup = attachTypingListener(
        socket,
        conversationId,
        currentUser?._id,
        setTypingUser,
      );
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [conversationId, currentUser?._id]);

  if (!conversation)
    return <div className="p-4 border-b h-18.25 bg-card">Loading...</div>;

  const isGroup = conversation.type === "group";
  const otherUser = !isGroup
    ? conversation.participants.find((p) => p.user._id !== currentUser?._id)
        ?.user
    : null;

  const chatName = isGroup ? conversation.name : otherUser?.name;
  const chatInitials = chatName ? chatName.substring(0, 2).toUpperCase() : "U";
  const isOnline = otherUser?.isOnline;

  // Last Seen ক্যালকুলেশন
  let statusText = "Offline";
  if (isOnline) {
    statusText = "Online";
  } else if (otherUser?.lastSeen) {
    statusText = `Last seen at ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="p-4 border-b flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarFallback>{chatInitials}</AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
          ></span>
        </div>
        <div>
          <h2 className="font-semibold leading-none">{chatName}</h2>
          {!isGroup && (
            <span
              className={`text-xs ${
                typingUser
                  ? "text-primary font-medium italic animate-pulse"
                  : isOnline
                    ? "text-green-500 font-medium"
                    : "text-muted-foreground"
              }`}
            >
              {typingUser ? "typing..." : statusText}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* ... তোমার আগের আইকন বাটনগুলো ... */}
      </div>
    </div>
  );
}
