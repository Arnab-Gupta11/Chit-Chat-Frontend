"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Phone, Video, MoreVertical, Info } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ChatHeader() {
  return (
    <div className="p-4 border-b flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background bg-green-500 rounded-full"></span>
        </div>
        <div>
          <h2 className="font-semibold leading-none">Alice</h2>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon"><Phone className="w-5 h-5 text-muted-foreground" /></Button>
        <Button variant="ghost" size="icon"><Video className="w-5 h-5 text-muted-foreground" /></Button>
        <Button variant="ghost" size="icon"><Info className="w-5 h-5 text-muted-foreground" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
            <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
