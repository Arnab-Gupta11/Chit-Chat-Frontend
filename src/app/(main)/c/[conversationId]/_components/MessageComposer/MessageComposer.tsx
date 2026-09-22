"use client";
import { SocketEvent } from "@/constants/socketEvents";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile, Mic, X } from "lucide-react";
import { useSendMessageMutation } from "@/redux/features/message/message.api";
import { getSocket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setEditingMessage } from "@/redux/features/chatUi/chatUiSlice";

interface IMessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: IMessageComposerProps) {
  const [message, setMessage] = useState("");

  const dispatch = useAppDispatch();
  const editingMessage = useAppSelector((state) => state.chatUi.editingMessage);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
    } else {
      setMessage("");
    }
  }, [editingMessage]);

  //send message mutation
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  //Typing timout state
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // ১. টাইপিং ইন্ডিকেটর স্টপ করার সিগন্যাল পাঠানো
    const socket = await getSocket("/");
    socket.emit(SocketEvent.TYPING_STOP, { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (editingMessage) {
      // ২. Edit Mode: সকেটে এডিট ইভেন্ট ফায়ার করো
      socket.emit(SocketEvent.EDIT_MESSAGE, {
        messageId: editingMessage.id,
        conversationId,
        newText: message.trim(),
      });
      // মেসেজ এডিট হওয়ার পর এডিটিং স্টেট ক্লিয়ার করে দাও
      dispatch(setEditingMessage(null));
    } else {
      // ৩. Normal Mode: সাধারণ মেসেজ পাঠাও (Optimistic Update)
      sendMessage({
        conversationId,
        content: message.trim(),
      });
    }
    // শেষে ইনপুট বক্সটি ফাঁকা করে দাও
    setMessage("");
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    //Emit socket event
    const socket = await getSocket("/");
    socket.emit(SocketEvent.TYPING_START, { conversationId });
    // আগের টাইমার ক্লিয়ার করে নতুন ২ সেকেন্ডের টাইমার সেট করা
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(SocketEvent.TYPING_STOP, { conversationId });
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {/* 🪄 Editing Indicator */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-l-4 border-primary rounded-r-md text-sm mx-2">
          <div>
            <span className="font-semibold text-primary text-xs">
              Editing Message
            </span>
            <p className="text-muted-foreground truncate max-w-50 sm:max-w-md">
              {editingMessage.content}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => {
              dispatch(setEditingMessage(null));
              setMessage("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

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
    </div>
  );
}
