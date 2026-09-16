"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useGetMeQuery } from "@/redux/features/user/user.api";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  // Redux-এ ইউজার আছে কি না (অর্থাৎ ইউজার লগইন করা কি না) তা চেক করছি
  const user = useAppSelector((state) => state.auth.user);

  // যদি লগইন করা থাকে, তবেই ব্যাকএন্ড থেকে লেটেস্ট ডেটা আনব (skip: !user)
  useGetMeQuery(undefined, { skip: !user });

  // অ্যাপের শুরুতে যেকোনো গ্লোবাল লজিক এখানে থাকতে পারে
  useEffect(() => {
    console.log("App Initialized...");
  }, []);

  return <>{children}</>;
}