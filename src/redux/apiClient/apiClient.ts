import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiClient = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["User", "Conversation", "Message", "Notification"],

  endpoints: () => ({}),
});
