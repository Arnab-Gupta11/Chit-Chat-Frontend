"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Settings,
  User,
  Bell,
  LogOut,
  Users,
  Plus,
  Hash,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useLogoutMutation } from "@/redux/features/auth/auth.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGetConversationsQuery } from "@/redux/features/conversation/conversation.api";
import { NewChatModal } from "./_components/NewChatModal/NewChatModal";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal এর স্টেট

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = useAppSelector((state) => state.auth.user);
  const initials =
    mounted && user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  const [apiLogout] = useLogoutMutation();

  // 🪄 API Call: সাইডবারের কনভার্সেশন নিয়ে আসা
  const { data: convData, isLoading } = useGetConversationsQuery();
  const conversations = convData?.data?.conversations || [];

  const handleLogout = async () => {
    try {
      await apiLogout().unwrap();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="w-80 border-r flex flex-col bg-card h-full">
      {/* 🪄 New Chat Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">ChatApp</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8 bg-muted"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 space-y-1">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading chats...
            </div>
          )}

          {!isLoading && conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet. <br /> Click + to start a chat!
            </div>
          )}

          {conversations.map((chat) => {
            const isActive = pathname === `/c/${chat._id}`;
            const isGroup = chat.type === "group";

            // 🧠 Logic: এই চ্যাটটি কার সাথে?
            // যেহেতু পার্টিসিপেন্ট লিস্টে আমার নিজের নামও আছে, তাই অপরজনের নামটা খুঁজে বের করছি
            const otherUser = !isGroup
              ? chat.participants.find((p) => p.user._id !== user?._id)?.user
              : null;

            // চ্যাটের নাম কী দেখাব? গ্রুপ হলে গ্রুপের নাম, আর ডিরেক্ট চ্যাট হলে অপর ইউজারের নাম
            const chatName = isGroup ? chat.name : otherUser?.name;
            const chatInitials = chatName
              ? chatName.substring(0, 2).toUpperCase()
              : "U";
            const lastMessageText =
              chat.lastMessage?.content || "Started a conversation";

            return (
              <Link key={chat._id} href={`/c/${chat._id}`}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"}`}
                >
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarFallback>{chatInitials}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{chatName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {chat.lastMessage?.createdAt
                          ? new Date(
                              chat.lastMessage.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground truncate">
                        {lastMessageText}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors w-full border-none outline-none text-left">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
