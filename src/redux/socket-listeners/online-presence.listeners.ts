import { IConversation } from "@/types/conversation.types";
import { Socket } from "socket.io-client";

export const attachPrescenceListenters = (
  socket: Socket,
  updateCachedData: (
    updater: (draft: { data: { conversations: IConversation[] } }) => void,
  ) => void,
) => {
  // User Online Listener
  const onlineListener = ({ userId }: { userId: string }) => {
    updateCachedData((draft) => {
      draft.data.conversations.forEach((conv) => {
        const participant = conv.participants.find(
          (p) => p.user._id === userId,
        );
        if (participant) {
          participant.user.isOnline = true;
        }
      });
    });
  };

  //User Offline Listener
  const offlineListener = ({
    userId,
    lastSeen,
  }: {
    userId: string;
    lastSeen: string;
  }) => {
    updateCachedData((draft) => {
      draft.data.conversations.forEach((conv) => {
        const participant = conv.participants.find(
          (p) => p.user._id === userId,
        );
        if (participant) {
          participant.user.isOnline = false;
          participant.user.lastSeen = lastSeen;
        }
      });
    });
  };

  socket.on("user_online", onlineListener);
  socket.on("user_offline", offlineListener);
  return () => {
    socket.off("user_online", onlineListener);
    socket.off("user_offline", offlineListener);
  };
};
