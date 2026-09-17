import { disconnectAllSockets, getSocket } from "@/lib/socket";
import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";

export const useSocketConnect = () => {
  //Check if user is login
  const user = useAppSelector((state) => state.auth.user);
  useEffect(() => {
    let isMounted = true;

    const connectAllNamespaces = async () => {
      try {
        await Promise.all([getSocket("/"), getSocket("/notification")]);

        if (isMounted) {
          console.log("✅ All Sockets successfully connected!");
        }
      } catch (error) {
        console.error("❌ Failed to connect sockets:", error);
      }
    };

    if(user){
        //If user login then connect
        connectAllNamespaces();
    }
    else{
        disconnectAllSockets();
    }


    return () => {
        isMounted = false;
    }

    
  },[user]);
};
