import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchChats();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users');
      setUsers(response.data.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChats = async () => {
    if (!user) return;
    try {
      const response = await axios.get('http://localhost:3001/chats');
      setChats(response.data.filter(chat => 
        chat.senderId === user.id || chat.receiverId === user.id
      ));
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const sendMessage = async (receiverId, content, type = 'text') => {
    try {
      const newMessage = {
        senderId: user.id,
        receiverId,
        content,
        type,
        timestamp: new Date().toISOString(),
      };
      const response = await axios.post('http://localhost:3001/chats', newMessage);
      setChats([...chats, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const clearChat = async (partnerId) => {
    try {
      const chatsToClear = chats.filter(chat => 
        (chat.senderId === user.id && chat.receiverId === partnerId) ||
        (chat.senderId === partnerId && chat.receiverId === user.id)
      );
      
      for (const chat of chatsToClear) {
        await axios.delete(`http://localhost:3001/chats/${chat.id}`);
      }
      
      setChats(chats.filter(chat => 
        !(chat.senderId === user.id && chat.receiverId === partnerId) &&
        !(chat.senderId === partnerId && chat.receiverId === user.id)
      ));
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <ChatContext.Provider value={{
      users,
      selectedUser,
      setSelectedUser,
      chats,
      sendMessage,
      clearChat,
      isTyping,
      setIsTyping,
      fetchChats
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);