import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { AlertCircle, ShieldAlert, Copy, ExternalLink } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  
  const { login, signup, googleSignIn } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthDomainError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setAuthDomainError(null);
    try {
      await googleSignIn();
      navigate('/');
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Auth Error:", err);
    
    // Prioritize Unauthorized Domain Error
    if (err.code === 'auth/unauthorized-domain') {
      setAuthDomainError(window.location.hostname);
      return;
    }

    if (err.message && (err.message.includes("Only @gmail.com") || err.message.includes("addresses are allowed"))) {
      setError(err.message);
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      setError('Invalid email or password.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('Email is already in use.');
    } else if (err.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters.');
    } else if (err.code === 'auth/popup-closed-by-user') {
      setError('Sign in cancelled.');
    } else {
      setError('Failed to authenticate. ' + (err.message || 'Please try again.'));
    }
  };

  if (authDomainError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500/50 p-8 rounded-xl max-w-lg w-full shadow-2xl animate-fade-in-up text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Domain Not Authorized</h2>
          <p className="text-gray-400 mb-6">
            Firebase Authentication blocks sign-ins from unknown domains for security.
          </p>
          
          <div className="bg-black/50 p-4 rounded-lg text-left mb-6 border border-gray-800">
             <p className="text-gray-500 text-xs uppercase font-bold mb-2">You must add this domain:</p>
             <div className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
               <code className="text-green-400 font-mono text-sm">{authDomainError}</code>
               <button 
                onClick={() => navigator.clipboard.writeText(authDomainError)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy Domain"
               >
                 <Copy size={16} />
               </button>
             </div>
          </div>

          <div className="space-y-4">
            <a 
              href="https://console.firebase.google.com/project/movie-f513f/authentication/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition flex items-center justify-center"
            >
              Open Firebase Console <ExternalLink size={18} className="ml-2"/>
            </a>
            <button 
              onClick={() => setAuthDomainError(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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