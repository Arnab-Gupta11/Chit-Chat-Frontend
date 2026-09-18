import { ChatHeader } from "./_components/ChatHeader/ChatHeader";
import { MessageList } from "./_components/MessageList/MessageList";
import { MessageComposer } from "./_components/MessageComposer/MessageComposer";

export default async function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return (
    <div className="flex flex-col h-full bg-background relative">
      <ChatHeader />
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <MessageList conversationId={conversationId}/>
      </div>
      <div className="p-4 bg-background border-t mt-auto relative z-10">
        <MessageComposer conversationId={conversationId}/>
      </div>
    </div>
  );
}
