import { apiClient } from "@/redux/apiClient/apiClient";
import { IConversation } from "@/types/conversation.types";

export const conversationApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get all conversation
    getConversations: builder.query<{ data: { conversations: IConversation[] } }, void>({
      query: () => "/conversations",
      // (পরবর্তীতে আমরা এখানেও সকেট লিসেনার বসাব যাতে নতুন মেসেজ এলে সাইডবারের চ্যাটটি সবার উপরে চলে আসে!)
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
          dispatch(
            conversationApi.util.updateQueryData("getConversations", undefined, (draft) => {
              // সাইডবারের লিস্টের একদম শুরুতে নতুন চ্যাটটি যোগ করে দেওয়া
              const exists = draft.data.conversations.some(c => c._id === data.data._id);
              if (!exists) {
                draft.data.conversations.unshift(data.data);
              }
            })
          );
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
});
export const { useGetConversationsQuery, useCreateConversationMutation } = conversationApi;