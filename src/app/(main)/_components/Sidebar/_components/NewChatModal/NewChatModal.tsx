"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useCreateConversationMutation } from "@/redux/features/conversation/conversation.api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { useSearchUsersQuery } from "@/redux/features/user/user.api";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // RTK Query: সার্চ বক্সে কিছু লিখলে API কল হবে
  const { data, isLoading } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 2, // অন্তত ২টা অক্ষর না লেখা পর্যন্ত API কল স্কিপ করবে (Optimization)
  });

  const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

  const handleStartChat = async (userId: string) => {
    try {
      // 🪄 API Call: নতুন চ্যাট তৈরি করা
      const response = await createConversation({
        type: "direct",
        participants: [userId],
      }).unwrap();

      onClose(); // Modal বন্ধ করা
      router.push(`/c/${response.data._id}`); // সাথে সাথে ওই ইউজারের চ্যাট পেজে নিয়ে যাওয়া!
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  const users = data?.data?.users || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {isLoading && <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          
          {!isLoading && searchTerm.length >= 2 && users.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-4">No users found.</div>
          )}

          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => handleStartChat(user._id)}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" disabled={isCreating}>Message</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


