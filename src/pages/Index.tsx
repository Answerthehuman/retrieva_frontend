import { ChatWindow } from '@/components/ChatWindow';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Login } from '@/components/Login';
import { useChatStore } from '@/store/chatStore';

const Index = () => {
  const { isSidebarOpen, isAuthenticated } = useChatStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '14rem' : '0' }}
      >
        <ChatWindow />
      </main>
    </div>
  );
};


export default Index;
