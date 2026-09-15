export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string; // For groups
  avatar?: string; // For groups
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  adminIds?: string[]; // For groups
  createdAt: Date;
  updatedAt: Date;
}
