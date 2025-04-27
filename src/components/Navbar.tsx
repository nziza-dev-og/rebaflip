import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/large-removebg-preview.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-black bg-opacity-90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
          <img src={logoImage} alt="Description of Image" width={180} height={115} />
            <span className="ml-2 text-xl font-bold">RebaFlip</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2">Home</Link>
              <Link to="/movies" className="text-gray-300 hover:text-white px-3 py-2">Movies</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-white px-3 py-2">Admin</Link>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2">
                    <User className="h-5 w-5" />
                  </Link>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-white px-3 py-2">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary">Login</Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-95">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2">Home</Link>
            <Link to="/movies" className="text-gray-300 hover:text-white block px-3 py-2">Movies</Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-gray-300 hover:text-white block px-3 py-2">Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-white block px-3 py-2">Profile</Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-white block w-full text-left px-3 py-2">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary block text-center">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 
