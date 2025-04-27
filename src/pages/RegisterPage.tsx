import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Film, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, adminCode);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create an account: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="flex-1 flex items-center justify-center p-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3&fit=fillmax&h=1080&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-6 left-6">
          <Link to="/" className="flex items-center text-white">
            <Film className="text-[#e50914] h-8 w-8" />
            <span className="ml-2 text-xl font-bold">CineFlix</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <input
                  id="adminCheckbox"
                  type="checkbox"
                  className="h-4 w-4 text-[#e50914] focus:ring-[#e50914] border-gray-600 rounded"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label htmlFor="adminCheckbox" className="ml-2 text-sm font-medium">
                  Register as Admin
                </label>
              </div>
              
              {isAdmin && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="adminCode" className="block text-sm font-medium">
                      Admin Secret Code
                    </label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Enter the admin secret code to gain admin privileges. This code is required for adding and managing movies.
                      </div>
                    </div>
                  </div>
                  <input
                    id="adminCode"
                    type="password"
                    className="input-field"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin secret code"
                  />
                  <p className="text-xs text-gray-400 mt-1">Required for admin privileges</p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full mb-4"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-gray-400">
              Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
 