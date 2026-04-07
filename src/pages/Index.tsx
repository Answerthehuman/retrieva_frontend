import { ChatWindow } from '@/components/ChatWindow';

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1">
        <ChatWindow />
      </main>
    </div>
  );
};

export default Index;
