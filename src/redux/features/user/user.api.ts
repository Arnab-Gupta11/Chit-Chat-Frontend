import { apiClient } from "../../apiClient/apiClient";
import { setCredentials } from "../auth/authSlice";

export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<any, void>({
      query: () => "/users/me",
      // যখনই ইউজার ডেটা আসবে, সাথে সাথে Redux-এ সেভ করে দেব
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data, // ব্যাকএন্ড থেকে আসা ডেটা
            }),
          );
        } catch (error) {
          // ফেইল করলে ইন্টারসেপ্টর বাকিটা সামলাবে
          console.log("Error from fetching user info: ", error);
        }
      },
    }),
    searchUsers: builder.query<{ data: { users: any[] } }, string>({
      query: (searchTerm) => `/users/search?q=${searchTerm}`,
    }),
  }),
});

export const { useGetMeQuery } = userApi;
