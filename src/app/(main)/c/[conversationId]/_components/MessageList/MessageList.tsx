"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { useEffect, useRef } from "react";

const MESSAGES = [
  { id: "1", content: "Hey! How are you?", senderId: "other", timestamp: "10:00 AM" },
  { id: "2", content: "I am good, thanks! How about you?", senderId: "me", timestamp: "10:05 AM", status: "read" },
  { id: "3", content: "I am doing well. Are we still on for the meeting today?", senderId: "other", timestamp: "10:06 AM" },
  { id: "4", content: "Yes! See you at 2 PM.", senderId: "me", timestamp: "10:10 AM", status: "delivered" },
];

export function MessageList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="flex flex-col gap-4">
        {MESSAGES.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === "me"} />
        ))}
        {/* Typing indicator placeholder */}
        <div className="text-xs text-muted-foreground italic ml-2">Alice is typing...</div>
      </div>
    </ScrollArea>
  );
}
