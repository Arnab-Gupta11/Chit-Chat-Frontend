import { apiClient } from "@/redux/apiClient/apiClient";
import { getSocket } from "@/lib/socket";
// যেহেতু তুমি টাইপগুলো আলাদা ফাইলে নিয়ে গেছ, তাই সেখান থেকে ইমপোর্ট করছি
import { IMessage } from "@/types/message.types";
import { RootState } from "@/redux/store"; // Redux স্টোর থেকে কারেন্ট ইউজার নেওয়ার জন্য
import { string } from "zod";
import { text } from "stream/consumers";

export const messageApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // 📥 GET MESSAGES (হিস্টোরি ফেচ + সকেট লিসেন) 
    // ==========================================
    getMessages: builder.query<
      { data: { messages: IMessage[] }; meta?: any },
      string
    >({
      // API কল করে ডাটাবেস থেকে পুরনো মেসেজগুলো নিয়ে আসা
      query: (conversationId) => `/conversations/${conversationId}/messages`,

      // 🪄 রিয়েল-টাইম সকেট ইন্টিগ্রেশন
      // WHY: ইউজার যেন পেজ রিলোড না করেই নতুন মেসেজ দেখতে পায়, তাই API কল শেষ হওয়ার পরপরই আমরা সকেট লিসেনার অন করে দিচ্ছি।
      async onCacheEntryAdded(
        conversationId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          // আগে নিশ্চিত হচ্ছি যে ডাটাবেস থেকে পুরনো ডেটা লোড হয়েছে
          await cacheDataLoaded;

          const socket = await getSocket("/");

          const messageListener = (newMessage: IMessage) => {
            // মেসেজটি কি এই চ্যাটেরই? অন্য চ্যাটের হলে ইগনোর করো।
            if (newMessage.conversation === conversationId) {
              updateCachedData((draft) => {
                // 🛑 Duplicate Prevention (ডুপ্লিকেট চেক)
                // WHY: Optimistic Update এর কারণে মেসেজটি আগে থেকেই ক্যাশে থাকতে পারে।
                // তাই সকেট থেকে মেসেজ এলে আমরা চেক করছি যে এটি আগে থেকেই আছে কি না।
                const alreadyExists = draft.data.messages.some(
                  (m) => m._id === newMessage._id,
                );

                if (!alreadyExists) {
                  draft.data.messages.push(newMessage);
                }
              });
            }
          };

          // ব্যাকএন্ড থেকে 'new_message' ইভেন্ট এলে লিসেনারটি ফায়ার হবে
          socket.on("new_message", messageListener);

          // 🧹 Memory Clean-up
          // WHY: ইউজার অন্য পেজে গেলে এই ক্যাশ রিমুভ হয়ে যাবে। তখন সকেট লিসেনার বন্ধ না করলে মেমোরি লিক হবে এবং ব্যাকগ্রাউন্ডে মেসেজ আসতে থাকবে।
          await cacheEntryRemoved;
          socket.off("new_message", messageListener);
          console.log(
            `🧹 Cleaned up socket listener for conversation: ${conversationId}`,
          );
        } catch (error) {
          console.error("Error in onCacheEntryAdded:", error);
        }
      },
    }),

    // ==========================================
    // 📤 SEND MESSAGE (Socket.IO + Optimistic Update)
    // ==========================================
    sendMessage: builder.mutation<
      { status: string; messageId: string; timeStamp: string }, // ব্যাকএন্ডের সকেট কলব্যাক যা রিটার্ন করে
      { conversationId: string; content: string }
    >({
      // 🪄 কাস্টম queryFn: HTTP এর বদলে সরাসরি Socket দিয়ে রিকোয়েস্ট পাঠানো!
      async queryFn({ conversationId, content }) {
        try {
          const socket = await getSocket("/");

          return new Promise((resolve) => {
            // ব্যাকএন্ড 'text' ফিল্ডটি এক্সপেক্ট করে, তাই content কে text হিসেবে পাঠাচ্ছি
            socket.emit(
              "send_message",
              { conversationId, text: content },
              (response: any) => {
                if (response.status === "success") {
                  resolve({ data: response });
                } else {
                  resolve({
                    error: { status: "CUSTOM_ERROR", error: response.error },
                  });
                }
              },
            );
          });
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Socket connection failed",
            },
          };
        }
      },

      // 🪄 Optimistic Update
      async onQueryStarted(
        { conversationId, content },
        { dispatch, queryFulfilled, getState },
      ) {
        const state = getState() as RootState;
        const currentUserId = state.auth.user?._id || "unknown";

        const tempId = `temp-${Date.now()}`;

        // ফেইক মেসেজ (Pending State)
        const optimisticMessage: IMessage = {
          _id: tempId,
          conversation: conversationId,
          content,
          sender: currentUserId,
          type: "text",
          attachments: [],
          reactions: [],
          readBy: [],
          deliveredTo: [],
          isEdited: false,
          isDeleted: false,
          replyTo: null,
          forwardedFrom: null,
          editedAt: null,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "pending",
        };

        const patchResult = dispatch(
          messageApi.util.updateQueryData(
            "getMessages",
            conversationId,
            (draft) => {
              draft.data.messages.push(optimisticMessage);
            },
          ),
        );

        try {
          // সকেটের কলব্যাক সফল হওয়া পর্যন্ত অপেক্ষা করছি
          const { data } = await queryFulfilled;

          dispatch(
            messageApi.util.updateQueryData(
              "getMessages",
              conversationId,
              (draft) => {
                // ১. সকেট ব্রডকাস্ট (new_message) কি এই কলব্যাকের আগেই চলে এসেছে?
                const realMessageExists = draft.data.messages.some(
                  (m) => m._id === data.messageId,
                );
                const tempIndex = draft.data.messages.findIndex(
                  (m) => m._id === tempId,
                );

                if (realMessageExists && tempIndex !== -1) {
                  // যদি সকেট ব্রডকাস্ট অলরেডি রিয়েল মেসেজটি ঢুকিয়ে দেয়, তবে এই ফেইক মেসেজটি ডিলিট করে দাও (Duplicate Prevention)
                  draft.data.messages.splice(tempIndex, 1);
                } else if (tempIndex !== -1) {
                  // আর যদি সকেট ব্রডকাস্ট আসতে লেট হয়, তবে ফেইক মেসেজটির আইডি চেঞ্জ করে আসল আইডি বসিয়ে দাও!
                  draft.data.messages[tempIndex]._id = data.messageId;
                  draft.data.messages[tempIndex].createdAt = data.timeStamp;
                  draft.data.messages[tempIndex].status = "sent";
                }
              },
            ),
          );
        } catch (error) {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = messageApi;
