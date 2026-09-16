import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { logout, setSessionExpired } from "../features/auth/authSlice";

// ১. নরমাল Base Query (যেটি কুকি সহ রিকোয়েস্ট পাঠাবে)
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api/v1",
  credentials: "include", // সব রিকোয়েস্টের সাথে ব্রাউজার কুকি পাঠাবে
});

// ২. আমাদের স্পেশাল Interceptor বা পাহারাদার
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // ধাপ ১: প্রথমে নরমাল রিকোয়েস্টটি করার চেষ্টা করো
  let result = await baseQuery(args, api, extraOptions);

  // URL চেক করা (যাতে login/register এর 401 এ interceptor ট্রিগার না হয়)
  const isAuthRoute =
    typeof args === "string"
      ? args.includes("/auth/login") ||
        args.includes("/auth/register") ||
        args.includes("/auth/refresh-token")
      : args.url.includes("/auth/login") ||
        args.url.includes("/auth/register") ||
        args.url.includes("/auth/refresh-token");

  // ধাপ ২: যদি রিকোয়েস্টটি 401 Unauthorized এরর খায় এবং সেটি auth রাউট না হয়
  if (result.error && result.error.status === 401 && !isAuthRoute) {
    console.log("Access token expired. Attempting silent refresh...");

    // ধাপ ৩: সাইলেন্টলি রিফ্রেশ রাউটে রিকোয়েস্ট পাঠাও
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      console.log("Token refreshed successfully. Retrying original request...");
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh token expired. Showing session expired modal...");

      // লগআউট বা রিডাইরেক্ট না করে শুধু Modal অন করার সিগন্যাল দিচ্ছি!
      api.dispatch(setSessionExpired(true));
    }
  }

  return result;
};

// ৩. আমাদের API Client তৈরি করা
export const apiClient = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, // আমাদের নতুন পাহারাদারকে যুক্ত করে দিলাম
  tagTypes: ["User", "Conversation", "Message", "Notification"],
  endpoints: () => ({}),
});
