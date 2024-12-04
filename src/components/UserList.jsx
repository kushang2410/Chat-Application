import { useChat } from '../context/ChatContext';

function UserList({ show, onSelectUser }) {
  const { users, selectedUser, setSelectedUser } = useChat();

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    onSelectUser?.();
  };

  return (
    <div className={`
      ${show ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      transition-transform duration-300 ease-in-out
      absolute lg:relative
      w-full lg:w-80 xl:w-96
      h-full
      bg-white dark:bg-gray-800
      border-r border-gray-200 dark:border-gray-700
      z-10
    `}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Chats</h2>
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer
                ${selectedUser?.id === user.id 
                  ? 'bg-primary bg-opacity-10 dark:bg-dark dark:bg-opacity-10' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <img
                src={user.profileImage || 'https://via.placeholder.com/40'}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserList;