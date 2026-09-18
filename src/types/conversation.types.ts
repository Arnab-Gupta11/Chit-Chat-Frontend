export interface IConversation {
  _id: string;
  type: string;
  name?: string; // Group এর ক্ষেত্রে
  participants: any[]; // Populated user objects
  lastMessage?: any; // Populated message
  updatedAt: string;
  unreadCount?: number; // (Optional)
}