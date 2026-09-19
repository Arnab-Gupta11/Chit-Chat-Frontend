import { Socket } from "socket.io-client";
import { IMessage } from "@/types/message.types";

export const attachActiveChatMessageListener = (
  socket: Socket,
  conversationId: string,
  updateCachedData: (
    updater: (draft: { data: { messages: IMessage[] } }) => void,
  ) => void,
) => {
  const messageListener = (newMessage: IMessage) => {
    if (newMessage.conversation === conversationId) {
      updateCachedData((draft) => {
        const alreadyExists = draft.data.messages.some(
          (m) => m._id === newMessage._id,
        );

        if (!alreadyExists) {
          draft.data.messages.push(newMessage);
        }
      });
    }
  };

  socket.on("new_message", messageListener);

  return () => {
    socket.off("new_message", messageListener);
  };
};
