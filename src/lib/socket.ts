import { io, Socket } from "socket.io-client";
import { SOCKET_CONFIG, TNamespace } from "./socket.config";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const socketInstances: Partial<Record<TNamespace, Socket>> = {};
const socketPromises: Partial<Record<TNamespace, Promise<Socket>>> = {};

export const getSocket = async (namespace: TNamespace): Promise<Socket> => {
  //1. If user is already connected return existand socket instance.
  if (socketInstances[namespace]?.connected) {
    return socketInstances[namespace];
  }
  //2. If the connection process is running wait. (race condition)
  if (socketPromises[namespace]) {
    return socketPromises[namespace]!;
  }
  //2. Create new connection
  const creationPromise = new Promise<Socket>((resolve, reject) => {
    const config = SOCKET_CONFIG[namespace];

    //Create the Url Based on namespace
    const url = namespace === "/" ? SOCKET_URL : `${SOCKET_URL}${namespace}`;

    //Initialize socket
    const socket = io(url, {
      autoConnect: config.autoConnect,
      transports: config.transports,
      withCredentials: config.withCredentials,
    });
    socket.connect();

    //If socket not connect within 10 sec throw error.
    const timeout = setTimeout(() => {
      reject(new Error(`Connection timeout for namespaace: ${namespace}`));
    },10000);

    //If connect successfully.
    socket.on("connect", () => {
      clearTimeout(timeout);
      console.log(`🔌 [${namespace}] Connected! ID: ${socket.id}`);
      resolve(socket);
    });

    //If connection error occured
    socket.on("connect_error", (err) => {
      clearTimeout(timeout);
      console.error(`❌ [${namespace}] Connection Error:`, err.message);
      reject(err);
    });

    //Disconnect
    socket.on("disconnect", (reason) => {
      console.warn(`⚠️ [${namespace}] Disconnected: ${reason}`);
    });

    //save the instance
    socketInstances[namespace] = socket;
  });
  socketPromises[namespace] = creationPromise;

  try {
    await creationPromise;
  } catch (error) {
    // If error occured promise will be deleted , so that try later.
    delete socketPromises[namespace];
  }
  return creationPromise;
};

// Disconnect a specific namespace
export const disconnectSocket = (ns: TNamespace = "/") => {
  if (socketInstances[ns]) {
    socketInstances[ns]?.disconnect();
    delete socketInstances[ns];
    delete socketPromises[ns];
    console.log(`🔌 [${ns}] Disconnected manually.`);
  }
};

// When logout disconnect all namespace
export const disconnectAllSockets = () =>{
    Object.keys(socketInstances).forEach((ns)=>{
        disconnectSocket(ns as TNamespace);
    })
}