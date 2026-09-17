export type TNamespace = "/" | "/notification";

export interface ISocketNamespaceConfig {
    autoConnect: boolean;
    transports: ("polling" | "websocket")[];
    withCredentials?:boolean;
}


export const SOCKET_CONFIG : Record<TNamespace,ISocketNamespaceConfig> = {
    "/" : {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials:true
    },
    "/notification" : {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials:true
    }
}