"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile, Mic } from "lucide-react";
import { useSendMessageMutation } from "@/redux/features/message/message.api";
import { getSocket } from "@/lib/socket";

interface IMessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: IMessageComposerProps) {
  const [message, setMessage] = useState("");

  //Send message mutation
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  //Typing timout state
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    getSocket("/").then((socket) =>
      socket.emit("typing_stop", { conversationId }),
    );
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // মিউটেশন কল করছি
    sendMessage({
      conversationId,
      content: message.trim(),
    });
    // কারণ আমাদের Optimistic Update মেসেজটিকে সাথে সাথেই চ্যাট লিস্টে দেখিয়ে দেবে!
    setMessage("");
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    //Emit socket event
    const socket = await getSocket("/");
    socket.emit("typing_start", { conversationId });
    // আগের টাইমার ক্লিয়ার করে নতুন ২ সেকেন্ডের টাইমার সেট করা
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId });
    }, 2000);
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-end gap-2 bg-muted p-2 rounded-xl"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground rounded-full"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
      <div className="flex-1 bg-background rounded-xl border flex items-center pr-2">
        <Input
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-xl flex-1"
          disabled={isLoading} // সেন্ড হতে কয়েক মিলি-সেকেন্ড সময় লাগলে ইনপুট ডিসেবল থাকবে
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground"
        >
          <Smile className="w-5 h-5" />
        </Button>
      </div>
      {message.trim() ? (
        <Button
          type="submit"
          size="icon"
          disabled={isLoading}
          className="shrink-0 rounded-full bg-primary text-primary-foreground"
        >
          <Send className="w-5 h-5" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 rounded-full text-muted-foreground bg-background"
        >
          <Mic className="w-5 h-5" />
        </Button>
      )}
    </form>
  );
}
