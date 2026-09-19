"use client";

import { MessageBubble } from "../MessageBubble/MessageBubble";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useGetMessagesQuery } from "@/redux/features/message/message.api";

interface IMessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: IMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  //Get Current User
  const currentUser = useAppSelector((state) => state.auth.user);

  //First time api call then socket listen
  const { data, isLoading, isError } = useGetMessagesQuery(conversationId);
  const messages = data?.data?.messages || [];

  //Scroll down if new message come.
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        Loading messages...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex-1 p-4 text-red-500 text-center">
        Failed to load messages
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4"
      ref={scrollRef}
    >
      {messages.map((msg) => {
        // sender অবজেক্ট নাকি শুধু আইডি, সেটি চেক করে নিজের মেসেজ কি না বের করছি
        const senderId =
          typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
        const isOwn = senderId === currentUser?._id;
        return (
          <MessageBubble
            key={msg._id}
            // MessageBubble কম্পোনেন্টে তোমার আগের ডামি ডেটার ফরম্যাটের সাথে মিল রাখার জন্য ডেটা ম্যাপ করে দিচ্ছি
            message={{
              id: msg._id,
              content: msg.content,
              timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: msg.status || "sent",
            }}
            isOwn={isOwn}
          />
        );
      })}
    </div>
  );
}
