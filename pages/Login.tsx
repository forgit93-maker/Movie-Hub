import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup, googleSignIn } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err: any) {
      // Check for custom validation errors first
      if (err.message && (err.message.includes("Only @gmail.com") || err.message.includes("addresses are allowed"))) {
        setError(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain (${window.location.hostname}) is not authorized. Add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else {
        setError('Failed to authenticate. ' + (err.message || 'Please try again.'));
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await googleSignIn();
      navigate('/');
    } catch (err: any) {
      if (err.message && err.message.includes("Only @gmail.com")) {
        setError(err.message);
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain (${window.location.hostname}) is not authorized. Add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else {
        setError('Failed to sign in with Google. ' + (err.message || ''));
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center flex items-center justify-center px-4 relative">
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-black/75 border border-white/10 p-8 md:p-16 rounded-xl max-w-md w-full shadow-2xl animate-fade-in-up">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 flex items-center text-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email or phone number"
              className="w-full bg-gray-800/50 border border-gray-600 text-white p-3.5 rounded focus:outline-none focus:border-primary focus:bg-gray-800 transition-colors placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-800/50 border border-gray-600 text-white p-3.5 rounded focus:outline-none focus:border-primary focus:bg-gray-800 transition-colors placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded hover:bg-red-700 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-600"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-white text-gray-900 font-bold py-3.5 rounded hover:bg-gray-200 transition transform active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>

        <div className="mt-8 text-gray-400 text-sm text-center">
          {isLogin ? (
            <p>New to Movie Hub? <button onClick={() => { setIsLogin(false); setError(''); }} className="text-white hover:underline font-medium">Sign up now</button>.</p>
          ) : (
            <p>Already have an account? <button onClick={() => { setIsLogin(true); setError(''); }} className="text-white hover:underline font-medium">Sign in</button>.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;