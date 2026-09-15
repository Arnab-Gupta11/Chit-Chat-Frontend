import { MessageSquare } from "lucide-react";
export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20">
      <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
      <h2 className="text-xl font-medium text-foreground">Welcome to ChatApp</h2>
      <p>Select a conversation or start a new one</p>
    </div>
  );
}
