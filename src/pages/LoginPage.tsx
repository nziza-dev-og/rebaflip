import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Film, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError('Failed to sign in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setResetLoading(true);
      await resetPassword(resetEmail);
      setSuccess('Password reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else {
        setError('Error sending reset email. Please try again later.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="flex-1 flex items-center justify-center p-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3&fit=fillmax&h=1080&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-6 left-6">
          <Link to="/" className="flex items-center text-white">
            <Film className="text-[#e50914] h-8 w-8" />
            <span className="ml-2 text-xl font-bold">RebaFlip</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg">
          {showResetForm ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <button 
                  onClick={() => {
                    setShowResetForm(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Back to Login
                </button>
              </div>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mb-4 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/50 border border-green-700 text-white px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={handlePasswordReset}>
                <p className="mb-4 text-gray-300">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <div className="mb-6">
                  <label htmlFor="resetEmail" className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    className="input-field"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Send Reset Link
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">Sign In</h1>
              
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
                  />
                </div>
                
                <div className="mb-2">
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
                
                <div className="mb-6 text-right">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white text-sm"
                    onClick={() => {
                      setShowResetForm(true);
                      setError('');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="text-center mt-4">
                <p className="text-gray-400">
                  New to CineFlix? <Link to="/register" className="text-white hover:underline">Sign up now</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
 
