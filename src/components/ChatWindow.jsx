import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaImage, FaSmile, FaTrash, FaTimes, FaArrowLeft } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

function ChatWindow({ onBackClick }) {
  const { selectedUser, chats, sendMessage, clearChat, isTyping, setIsTyping } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef();
  const chatContainerRef = useRef();
  const typingTimeoutRef = useRef();
  const socketTimeoutRef = useRef();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size should not exceed 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview({
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: e.target.result,
        file
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!message.trim() && !mediaPreview) return;
    
    if (mediaPreview) {
      await sendMessage(selectedUser.id, mediaPreview.url, mediaPreview.type);
      setMediaPreview(null);
      fileInputRef.current.value = '';
    }

    if (message.trim()) {
      await sendMessage(selectedUser.id, message, 'text');
      setMessage('');
    }
    setShowEmoji(false);
  };

  const handleTyping = () => {
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    clearTimeout(socketTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    socketTimeoutRef.current = setTimeout(() => {
      if (selectedUser) {
        console.log(`${user.name} is typing...`);
      }
    }, 100);
  };

  const cancelMediaPreview = () => {
    setMediaPreview(null);
    fileInputRef.current.value = '';
  };

  const filteredChats = chats.filter(chat => 
    (chat.senderId === user.id && chat.receiverId === selectedUser?.id) ||
    (chat.senderId === selectedUser?.id && chat.receiverId === user.id)
  );

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-center px-4">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackClick}
            className="lg:hidden text-gray-500 dark:text-gray-400"
          >
            <FaArrowLeft size={20} />
          </button>
          <img
            src={selectedUser.profileImage || 'https://via.placeholder.com/40'}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium dark:text-white">{selectedUser.name}</h3>
            {isTyping && (
              <p className="text-sm text-gray-500 dark:text-gray-400">typing...</p>
            )}
          </div>
        </div>
        <button
          onClick={() => clearChat(selectedUser.id)}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400"
        >
          <FaTrash />
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
      >
        {filteredChats.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] sm:max-w-[60%] rounded-lg p-3 ${
                chat.senderId === user.id
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 dark:text-white'
              }`}
            >
              {chat.type === 'text' && <p className="break-words">{chat.content}</p>}
              {chat.type === 'image' && (
                <img src={chat.content} alt="Shared" className="max-w-full rounded" />
              )}
              {chat.type === 'video' && (
                <video controls className="max-w-full rounded">
                  <source src={chat.content} type="video/mp4" />
                </video>
              )}
              <p className="text-xs mt-1 opacity-70">
                {format(new Date(chat.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {mediaPreview && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t dark:border-gray-700">
          <div className="relative inline-block">
            {mediaPreview.type === 'image' ? (
              <img 
                src={mediaPreview.url} 
                alt="Preview" 
                className="max-h-40 rounded-lg"
              />
            ) : (
              <video 
                src={mediaPreview.url} 
                className="max-h-40 rounded-lg" 
                controls
              />
            )}
            <button
              onClick={cancelMediaPreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message"
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-primary dark:text-gray-400"
          >
            <FaImage />
          </button>
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-500 hover:text-primary dark:text-gray-400"
          >
            <FaSmile />
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
          >
            Send
          </button>
        </div>
        {showEmoji && (
          <div className="absolute bottom-20 right-4 z-50">
            <div className="relative">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage(prev => prev + emojiData.emoji);
                  setShowEmoji(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;