"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile, Mic } from "lucide-react";

export function MessageComposer() {
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <form onSubmit={handleSend} className="flex items-end gap-2 bg-muted p-2 rounded-xl">
      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full">
        <Paperclip className="w-5 h-5" />
      </Button>
      <div className="flex-1 bg-background rounded-xl border flex items-center pr-2">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-xl flex-1"
        />
        <Button type="button" variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground">
          <Smile className="w-5 h-5" />
        </Button>
      </div>
      {message.trim() ? (
        <Button type="submit" size="icon" className="shrink-0 rounded-full bg-primary text-primary-foreground">
          <Send className="w-5 h-5" />
        </Button>
      ) : (
        <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-full text-muted-foreground bg-background">
          <Mic className="w-5 h-5" />
        </Button>
      )}
    </form>
  );
}
