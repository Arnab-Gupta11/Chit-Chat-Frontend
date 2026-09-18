export interface IAttachment {
  type: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}
export interface IReaction {
  user: any; // User object
  emoji: string;
  createdAt: string;
}
export interface IReadReceipt {
  user: string;
  readAt: string;
}
export interface IDeliveryReceipt {
  user: string;
  deliveredAt: string;
}
export interface IForwardedFrom {
  message: string;
  conversation: string;
  sender: any;
}
export interface IMessage {
  _id: string;
  conversation: string;
  sender: any; // Populated User Object
  content: string;
  type: string;
  replyTo: string | IMessage | null;
  forwardedFrom: IForwardedFrom | null;
  attachments: IAttachment[];
  reactions: IReaction[];
  readBy: IReadReceipt[];
  deliveredTo: IDeliveryReceipt[];
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  status?: "pending" | "sent" | "failed";
}
