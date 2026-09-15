"use client";
import { Check, CheckCheck, MoreHorizontal, Reply, Smile } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";

interface MessageBubbleProps {
  message: { id: string; content: string; timestamp: string; status?: string };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col group ${isOwn ? "items-end" : "items-start"}`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`p-3 rounded-2xl relative group ${isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}>
            <span>{message.timestamp}</span>
            {isOwn && message.status === "read" && <CheckCheck className="w-3 h-3" />}
            {isOwn && message.status === "delivered" && <Check className="w-3 h-3" />}
          </div>
          
          {/* Quick actions on hover */}
          <div className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-background border shadow-sm rounded-md ${isOwn ? "left-0 -translate-x-full -ml-2" : "right-0 translate-x-full ml-2"}`}>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Reply className="w-3 h-3" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-6 w-6" })}>
                <MoreHorizontal className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Copy</DropdownMenuItem>
                <DropdownMenuItem>Reply</DropdownMenuItem>
                {isOwn && <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
