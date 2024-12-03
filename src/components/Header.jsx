import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaSignOutAlt, FaBars } from 'react-icons/fa';

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="bg-primary dark:bg-dark p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white hover:text-gray-200"
        >
          <FaBars size={20} />
        </button>
        <img
          src={user?.profileImage || 'https://via.placeholder.com/40'}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <span className="text-white font-semibold sm:inline">{user?.name}</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="text-white hover:text-gray-200"
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
        <button
          onClick={logout}
          className="text-white hover:text-gray-200"
        >
          <FaSignOutAlt size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;