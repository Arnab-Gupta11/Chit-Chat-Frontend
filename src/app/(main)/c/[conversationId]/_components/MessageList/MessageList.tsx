"use client";

import { MessageBubble } from "../MessageBubble/MessageBubble";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useGetMessagesQuery } from "@/redux/features/message/message.api";
import { getSocket } from "@/lib/socket";
import { SocketEvent } from "@/constants/socketEvents";

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

  const emittedReads = useRef<Set<string>>(new Set());

  // 🪄 Unread মেসেজগুলোকে Read মার্ক করার লজিক
  useEffect(() => {
    const markMessagesAsRead = async () => {
      // যদি ইউজার ট্যাবে না থাকে, তবে কিছু করার দরকার নেই
      if (document.visibilityState !== "visible" || !currentUser) return;

      const unreadMessages = messages.filter((msg: any) => {
        const senderId =
          typeof msg.sender === "object" ? msg.sender?._id : msg.sender;

        // নিজের মেসেজ হলে বাদ
        if (senderId === currentUser._id) return false;
        // আগে একবার Read পাঠিয়ে থাকলে বাদ
        if (emittedReads.current.has(msg._id)) return false;

        // আমি অলরেডি readBy অ্যারেতে আছি কি না চেক করি
        const hasRead = msg.readBy?.some(
          (r: any) =>
            (typeof r.user === "object" ? r.user._id : r.user) ===
            currentUser._id,
        );
        return !hasRead;
      });

      if (unreadMessages.length === 0) return;

      const socket = await getSocket("/");
      unreadMessages.forEach((msg: any) => {
        socket.emit(SocketEvent.MESSAGE_READ, {
          messageId: msg._id,
          conversationId: msg.conversation,
        });
        emittedReads.current.add(msg._id);
      });
    };

    // ১. মেসেজ লোড বা চেঞ্জ হলে রান করবে
    markMessagesAsRead();

    // ২. ইউজার যখনই অন্য ট্যাব থেকে এই ট্যাবে ফিরে আসবে (visibilitychange) তখন রান করবে
    document.addEventListener("visibilitychange", markMessagesAsRead);
    return () =>
      document.removeEventListener("visibilitychange", markMessagesAsRead);
  }, [messages, currentUser, conversationId]);

  //Scroll down if new message come.
  const prevMessageCount = useRef(messages.length);
  // Scroll down ONLY if a NEW message comes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;

      // শুধুমাত্র যদি নতুন মেসেজ অ্যাড হয় (বর্তমান সংখ্যা > আগের সংখ্যা), তবেই নিচে স্ক্রল করো
      if (messages.length > prevMessageCount.current) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }

      // বর্তমান সংখ্যাটি সেভ করে রাখো ভবিষ্যতের চেকের জন্য
      prevMessageCount.current = messages.length;
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

        // Dynamic message status
        let currentStatus:
          | "pending"
          | "sent"
          | "failed"
          | "delivered"
          | "read" = msg.status || "sent";
        if (msg.readBy && msg.readBy.length > 0) {
          currentStatus = "read";
        } else if (msg.deliveredTo && msg.deliveredTo.length > 0) {
          currentStatus = "delivered";
        }
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
              status: currentStatus,
              isEdited: msg.isEdited,
              isDeleted:msg.isDeleted
            }}
            isOwn={isOwn}
          />
        );
      })}
    </div>
  );
}
