"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { useEffect, useRef } from "react";

interface IMessageListProps{
  conversationId:string
}

export function MessageList({conversationId}:IMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  //Get Current User
  
  
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
