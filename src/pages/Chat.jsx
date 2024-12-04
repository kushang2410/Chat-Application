import { useState } from 'react';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';

function Chat() {
  const [showUserList, setShowUserList] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      <Header onMenuClick={() => setShowUserList(!showUserList)} />
      <div className="flex-1 flex overflow-hidden">
        <UserList show={showUserList} onSelectUser={() => setShowUserList(false)} />
        <ChatWindow onBackClick={() => setShowUserList(true)} />
      </div>
    </div>
  );
}

export default Chat;