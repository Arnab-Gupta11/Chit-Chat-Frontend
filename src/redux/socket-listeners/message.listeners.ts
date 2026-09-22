import { SocketEvent } from "@/constants/socketEvents";
import { Socket } from "socket.io-client";
import { IMessage } from "@/types/message.types";

export const attachActiveChatMessageListener = (
  socket: Socket,
  conversationId: string,
  updateCachedData: (
    updater: (draft: { data: { messages: IMessage[] } }) => void,
  ) => void,
) => {
  //New Message Listener
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

      // 🪄 ১. মেসেজ স্ক্রিনে আসলে এবং ব্রাউজার ট্যাবে ভিজিবল থাকলে Read সিগন্যাল দাও!
      if (document.visibilityState === "visible") {
        socket.emit(SocketEvent.MESSAGE_READ, {
          messageId: newMessage._id,
          conversationId: newMessage.conversation,
        });
      } else {
        // 🪄 চ্যাট ওপেন আছে, কিন্তু ব্রাউজার মিনিমাইজ করা বা অন্য ট্যাবে আছে (Delivered সিগন্যাল দাও)
        socket.emit(SocketEvent.MESSAGE_DELIVERED, {
          messageId: newMessage._id,
          conversationId: newMessage.conversation,
        });
      }
    } else {
      // 🪄 ২. অন্য চ্যাটের মেসেজ ব্যাকগ্রাউন্ডে এলে শুধু Delivered সিগন্যাল দাও
      socket.emit(SocketEvent.MESSAGE_DELIVERED, {
        messageId: newMessage._id,
        conversationId: newMessage.conversation,
      });
    }
  };

  //Delivery Update Listener
  const deliveryListener = (data: {
    messageId: string;
    deliveredAt: string;
  }) => {
    updateCachedData((draft) => {
      const msg = draft.data.messages.find((m) => m._id === data.messageId);
      if (msg) {
        msg.deliveredTo.push({ user: "any", deliveredAt: data.deliveredAt });
      }
    });
  };
  // Read Update Listener
  const readListener = (data: { messageId: string; readAt: string }) => {
    updateCachedData((draft) => {
      const msg = draft.data.messages.find((m) => m._id === data.messageId);
      if (msg) {
        msg.readBy.push({ user: "any", readAt: data.readAt });
      }
    });
  };

  // Edit Update Listener
  const editListener = (data: {
    messageId: string;
    newText: string;
    editedAt: string;
  }) => {
    updateCachedData((draft) => {
      const msg = draft.data.messages.find((m) => m._id === data.messageId);
      if (msg) {
        msg.content = data.newText;
        msg.isEdited = true;
        msg.editedAt = data.editedAt;
      }
    });
  };

  // Delete Update Listener
  const deleteListener = (data: { messageId: string; deletedAt: string }) => {
    updateCachedData((draft) => {
      const msg = draft.data.messages.find((m) => m._id === data.messageId);
      if (msg) {
        msg.content = "This message was deleted";
        msg.isDeleted = true; // ফ্ল্যাগটি true করে দিলাম
        msg.deletedAt = data.deletedAt;
      }
    });
  };

  socket.on(SocketEvent.NEW_MESSAGE, messageListener);
  socket.on(SocketEvent.DELIVERY_UPDATE, deliveryListener);
  socket.on(SocketEvent.READ_UPDATE, readListener);
  socket.on(SocketEvent.MESSAGE_EDITED, editListener);
  socket.on(SocketEvent.MESSAGE_DELETED, deleteListener);

  return () => {
    socket.off(SocketEvent.NEW_MESSAGE, messageListener);
    socket.off(SocketEvent.DELIVERY_UPDATE, deliveryListener);
    socket.off(SocketEvent.READ_UPDATE, readListener);
    socket.off(SocketEvent.MESSAGE_EDITED, editListener);
    socket.off(SocketEvent.MESSAGE_DELETED, deleteListener);
  };
};
