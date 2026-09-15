"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, User, Bell, LogOut, Users, Plus, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Dummy data
const CONVERSATIONS = [
  { id: "1", type: "direct", name: "Alice", lastMessage: "Hey, how are you?", unread: 2, online: true },
  { id: "2", type: "group", name: "Engineering Team", lastMessage: "Deployment successful.", unread: 0 },
  { id: "3", type: "direct", name: "Bob", lastMessage: "Can we sync later?", unread: 0, online: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-80 border-r flex flex-col bg-card h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">ChatApp</h1>
        <Button variant="ghost" size="icon">
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search conversations..." className="pl-8 bg-muted" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 space-y-1">
          {CONVERSATIONS.map((chat) => {
            const isActive = pathname === `/c/${chat.id}`;
            return (
              <Link key={chat.id} href={`/c/${chat.id}`}>
                <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"}`}>
                  <div className="relative">
                    {chat.type === "group" ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    {chat.type === "direct" && chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">12:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground truncate">{chat.lastMessage}</span>
                      {chat.unread > 0 && (
                        <Badge variant="default" className="w-5 h-5 flex items-center justify-center p-0 text-[10px] rounded-full">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex-1 w-full text-left outline-none border-none bg-transparent">
            <Avatar className="w-8 h-8">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-medium truncate">My Profile</p>
              <p className="text-xs text-muted-foreground truncate">Online</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile"><DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem></Link>
            <Link href="/settings"><DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem></Link>
            <DropdownMenuItem><Bell className="mr-2 h-4 w-4" /> Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href="/login"><DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem></Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
