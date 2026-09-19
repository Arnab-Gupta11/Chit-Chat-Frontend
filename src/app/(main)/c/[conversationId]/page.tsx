import { ChatHeader } from "./_components/ChatHeader/ChatHeader";
import { MessageList } from "./_components/MessageList/MessageList";
import { MessageComposer } from "./_components/MessageComposer/MessageComposer";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <ChatHeader conversationId={conversationId} />
      <div className="flex-1 min-h-0 relative">
        <MessageList conversationId={conversationId} />
      </div>
      <div className="p-4 bg-background border-t shrink-0">
        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
}
