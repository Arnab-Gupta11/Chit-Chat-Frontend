import { SocketEvent } from "@/constants/socketEvents";
import { getSocket } from "@/lib/socket";
import { apiClient } from "@/redux/apiClient/apiClient";
import { attachSidebarMessageListener } from "@/redux/socket-listeners/conversation.listeners";
import { attachPrescenceListenters } from "@/redux/socket-listeners/online-presence.listeners";
import { IConversation } from "@/types/conversation.types";

export const conversationApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversation
    getConversations: builder.query<
      { data: { conversations: IConversation[] } },
      void
    >({
      query: () => "/conversations",

      // 🪄 Sidebar Real-Time Magic
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          const { data } = await cacheDataLoaded;
          const socket = await getSocket("/");

          // ১. সাইডবার লোড হলে ইউজারের সবগুলো চ্যাটরুমে তাকে জয়েন করিয়ে দাও
          data.data.conversations.forEach((conv) => {
            socket.emit(SocketEvent.JOIN_CONVERSATION, { conversationId: conv._id });
          });

          // ২. এক্সট্রাক্ট করা লিসেনার কল করছি
          const cleanupMessageListener = attachSidebarMessageListener(
            socket,
            updateCachedData,
          );
          const cleanupPresenceListener = attachPrescenceListenters(
            socket,
            updateCachedData,
          );

          await cacheEntryRemoved;
          // ক্লিনআপ
          cleanupMessageListener();
          cleanupPresenceListener();
        } catch (error) {
          console.error("Sidebar socket error:", error);
        }
      },
    }),

    // Create new chat / conversation
    createConversation: builder.mutation<
      { data: IConversation },
      { type: "direct" | "group"; participants: string[]; name?: string }
    >({
      query: (body) => ({
        url: "/conversations",
        method: "POST",
        body,
      }),
      // নতুন চ্যাট তৈরি হলে যাতে সাইডবার অটোমেটিক আপডেট হয়, তার জন্য ক্যাশ ইনভ্যালিডেট করতে পারো
      // অথবা ম্যানুয়ালি updateQueryData করতে পারো (আপাতত সিম্পল রাখছি)
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const socket = await getSocket("/");

          dispatch(
            conversationApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                // সাইডবারের লিস্টের একদম শুরুতে নতুন চ্যাটটি যোগ করে দেওয়া
                const exists = draft.data.conversations.some(
                  (c) => c._id === data.data._id,
                );
                if (!exists) {
                  draft.data.conversations.unshift(data.data);
                }
              },
            ),
          );

          // সদ্য তৈরি হওয়া চ্যাটরুমে গ্লোবালি জয়েন করে নেওয়া (যাতে সাইডবার আপডেট মিস না হয়)
          socket.emit(SocketEvent.JOIN_CONVERSATION, { conversationId: data.data._id });
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
});
export const { useGetConversationsQuery, useCreateConversationMutation } =
  conversationApi;
