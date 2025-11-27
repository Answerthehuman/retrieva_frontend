import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { useChatStore } from '@/store/chatStore';

const Index = () => {
  const { isSidebarOpen } = useChatStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      
      {/* Main content with dynamic margin */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <ChatWindow />
      </main>
    </div>
  );
};

export default Index;
