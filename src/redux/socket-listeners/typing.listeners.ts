import { SocketEvent } from "@/constants/socketEvents";
import { Socket } from "socket.io-client";

export const attachTypingListener = (
  socket: Socket,
  conversationId: string,
  currentUserId: string | undefined,
  setTypingUser: (userName: string | null) => void,
) => {
  const handleTyping = (data: {
    conversationId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => {
    // ইভেন্টটি যদি এই চ্যাটের হয় এবং অন্য ইউজারের হয়
    if (
      data.conversationId === conversationId &&
      data.userId !== currentUserId
    ) {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    }
  };

  socket.on(SocketEvent.TYPING, handleTyping);

  // Clean-up function
  return () => {
    socket.off(SocketEvent.TYPING, handleTyping);
  };
};
