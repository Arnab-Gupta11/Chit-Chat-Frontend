import { SocketEvent } from "@/constants/socketEvents";
import { Socket } from "socket.io-client";
import { IConversation } from "@/types/conversation.types";

export const attachSidebarMessageListener = (
  socket: Socket,
  updateCachedData: (
    updater: (draft: { data: { conversations: IConversation[] } }) => void,
  ) => void,
) => {
  const globalMessageListener = (newMessage: any) => {
    updateCachedData((draft) => {
      const convIndex = draft.data.conversations.findIndex(
        (c) => c._id === newMessage.conversation,
      );

      if (convIndex !== -1) {
        // চ্যাটটি সাইডবারে থাকলে তার lastMessage আপডেট করে তাকে একদম উপরে (0 index) নিয়ে আসো
        const [updatedConv] = draft.data.conversations.splice(convIndex, 1);
        updatedConv.lastMessage = newMessage;
        draft.data.conversations.unshift(updatedConv);
      }
    });

    // 🪄 গ্লোবাল লিসেনার থেকেও ডেলিভারি সিগন্যাল দিতে হবে! (যাতে অন্য চ্যাটে থাকলেও ডেলিভারি টিক হয়)
    socket.emit(SocketEvent.MESSAGE_DELIVERED, {
      messageId: newMessage._id,
      conversationId: newMessage.conversation,
    });
  };

  socket.on(SocketEvent.NEW_MESSAGE, globalMessageListener);

  return () => {
    socket.off(SocketEvent.NEW_MESSAGE, globalMessageListener);
  };
};
