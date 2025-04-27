import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, AlertCircle, LogOut, Settings, Moon, Sun, 
  Bell, BellOff, Key, Info, Check, Sliders
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { 
    user, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    emailNotifications, 
    toggleEmailNotifications,
    updateAdminCode 
  } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Theme settings
  const [themeOpacity, setThemeOpacity] = useState(() => {
    const saved = localStorage.getItem('themeOpacity');
    return saved !== null ? parseInt(saved) : 100;
  });
  
  // Admin settings
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState('');
  const [adminCodeConfirm, setAdminCodeConfirm] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    // Apply theme opacity to body
    document.body.style.setProperty('--theme-opacity', `${themeOpacity}%`);
    localStorage.setItem('themeOpacity', themeOpacity.toString());
  }, [themeOpacity]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  };

  const handleUpdateAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminCode) {
      setError('Please enter a new admin code');
      return;
    }
    
    if (newAdminCode !== adminCodeConfirm) {
      setError('Admin codes do not match');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setUpdateLoading(true);
      await updateAdminCode(newAdminCode);
      setSuccess('Admin code updated successfully');
      setNewAdminCode('');
      setAdminCodeConfirm('');
      setShowAdminSettings(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update admin code');
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleThemeOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThemeOpacity(parseInt(e.target.value));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow">
            <div className="px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex justify-center items-center bg-gray-800 rounded-full p-6 mb-4 sm:mb-0 sm:mr-8">
                  <User className="h-16 w-16 text-gray-300" />
                </div>
                
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                  <p className="text-gray-300">{user.email}</p>
                  
                  {user.isAdmin && (
                    <div className="mt-2">
                      <span className="bg-[#e50914]/20 text-[#e50914] px-3 py-1 rounded-full text-sm">
                        Administrator
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mt-6 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/50 border border-green-700 text-white px-4 py-3 rounded mt-6 flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 px-6 py-4">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Log Out
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Account Settings</h2>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="p-6">
              <p className="text-gray-400 mb-6">
                Manage your account settings and preferences.
              </p>
              
              <div className="space-y-6">
                <div className="pb-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium">Theme Settings</h3>
                      <p className="text-sm text-gray-400 mt-1">Customize your viewing experience</p>
                    </div>
                    
                    <button 
                      onClick={toggleDarkMode}
                      className="p-1 rounded-full hover:bg-gray-800"
                    >
                      {darkMode ? (
                        <Moon className="h-6 w-6 text-[#e50914]" />
                      ) : (
                        <Sun className="h-6 w-6 text-yellow-400" />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="opacity-control" className="text-sm text-gray-300 flex items-center">
                        <Sliders className="h-4 w-4 mr-2" />
                        Theme Opacity
                      </label>
                      <span className="text-sm font-medium">{themeOpacity}%</span>
                    </div>
                    <input
                      id="opacity-control"
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={themeOpacity}
                      onChange={handleThemeOpacityChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      Adjust background opacity for better contrast
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-400 mt-1">Receive email updates about new releases</p>
                  </div>
                  <button 
                    onClick={toggleEmailNotifications}
                    className="p-1 rounded-full hover:bg-gray-800"
                  >
                    {emailNotifications ? (
                      <Bell className="h-6 w-6 text-[#e50914]" />
                    ) : (
                      <BellOff className="h-6 w-6 text-gray-500" />
                    )}
                  </button>
                </div>
                
                <div className="pb-4">
                  <h3 className="font-medium mb-2">Download Settings</h3>
                  <p className="text-sm text-gray-400 mb-3">Customize your download experience</p>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="download-hd"
                        type="checkbox"
                        className="h-4 w-4 text-[#e50914] focus:ring-[#e50914] border-gray-600 rounded"
                        defaultChecked
                      />
                      <label htmlFor="download-hd" className="ml-2 text-sm">
                        Prefer HD quality when available
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="download-notification"
                        type="checkbox"
                        className="h-4 w-4 text-[#e50914] focus:ring-[#e50914] border-gray-600 rounded"
                        defaultChecked
                      />
                      <label htmlFor="download-notification" className="ml-2 text-sm">
                        Show notification when download completes
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {user.isAdmin && (
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow mt-8">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Administrator Settings</h2>
                <Key className="h-5 w-5 text-[#e50914]" />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    Manage administrator settings and access controls.
                  </p>
                  <button
                    onClick={() => setShowAdminSettings(!showAdminSettings)}
                    className="btn-secondary text-sm"
                  >
                    {showAdminSettings ? 'Cancel' : 'Update Admin Code'}
                  </button>
                </div>
                
                {showAdminSettings && (
                  <form onSubmit={handleUpdateAdminCode} className="bg-gray-800 rounded-lg p-4 mt-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="newAdminCode" className="text-sm font-medium">
                          New Admin Secret Code
                        </label>
                        <div className="relative group">
                          <Info className="h-4 w-4 text-gray-400" />
                          <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            This code will be required for new users to register as administrators.
                          </div>
                        </div>
                      </div>
                      <input
                        id="newAdminCode"
                        type="password"
                        className="input-field"
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value)}
                        placeholder="Enter new admin code"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="adminCodeConfirm" className="block mb-2 text-sm font-medium">
                        Confirm Admin Code
                      </label>
                      <input
                        id="adminCodeConfirm"
                        type="password"
                        className="input-field"
                        value={adminCodeConfirm}
                        onChange={(e) => setAdminCodeConfirm(e.target.value)}
                        placeholder="Confirm new admin code"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={updateLoading}
                      >
                        {updateLoading ? (
                          <span className="flex items-center">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Updating...
                          </span>
                        ) : (
                          'Update Code'
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">Administrator Privileges</h3>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    <li>Add, edit, and delete movies</li>
                    <li>Manage featured content</li>
                    <li>Update admin access code</li>
                    <li>View platform analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
 