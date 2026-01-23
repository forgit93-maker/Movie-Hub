
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { AlertCircle, ShieldAlert, Copy, ExternalLink, Eye, EyeOff, ChevronLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, googleSignIn } = useStore();
  const navigate = useNavigate();

  const handleAuthError = (err: any) => {
    // Extract specific properties to avoid "Converting circular structure to JSON"
    const errorMessage = err?.message || "Unknown auth error";
    console.error("Auth Error Message:", errorMessage);
    
    if (err.code === 'auth/unauthorized-domain') {
      setAuthDomainError(window.location.hostname);
      return;
    }
    
    if (errorMessage.includes("Only @gmail.com") || errorMessage.includes("addresses are allowed")) {
      setError(errorMessage);
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      setError('Invalid email or password.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('Email is already in use.');
    } else if (err.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters.');
    } else if (err.code === 'auth/popup-closed-by-user') {
      setError('Sign in cancelled.');
    } else {
      setError('Failed to authenticate. ' + (errorMessage || 'Please try again.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthDomainError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        // SAFE ZONE: No ads on login trigger
        await login(email, password);
      } else {
        // SAFE ZONE: No ads on signup trigger
        await signup(email, password);
      }
      navigate('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setAuthDomainError(null);
    try {
      // SAFE ZONE: No ads on Google sign in
      await googleSignIn();
      navigate('/');
    } catch (err: any) {
      handleAuthError(err);
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
               >
                 <Copy size={16} />
               </button>
             </div>
          </div>
          <div className="space-y-4">
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition flex items-center justify-center"
            >
              Open Firebase Console <ExternalLink size={18} className="ml-2"/>
            </a>
            <button onClick={() => setAuthDomainError(null)} className="text-gray-400 hover:text-white text-sm">Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg" 
          alt="background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-[450px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in-up overflow-hidden">
        
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold"
        >
          <ChevronLeft size={16} /> Home
        </button>

        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join Movie Hub'}
            </h2>
            <p className="text-gray-400 text-sm">
                {isLogin ? 'Enter your details to access your account.' : 'Create an account to start your journey.'}
            </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 flex items-start text-sm backdrop-blur-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <input
              type="email"
              id="email"
              className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-white/5 border border-white/10 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all duration-300 placeholder-transparent"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.stopPropagation()}
              required
            />
            <label 
              htmlFor="email" 
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary"
            >
              Email Address
            </label>
          </div>

          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-white/5 border border-white/10 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all duration-300 placeholder-transparent pr-10"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.stopPropagation()}
              required
            />
            <label 
              htmlFor="password" 
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary"
            >
              Password
            </label>
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#E50914] to-[#B20710] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </span>
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <span className="px-3 text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "New to Movie Hub?" : "Already have an account?"} 
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="ml-2 text-white font-bold hover:text-primary transition-colors underline decoration-transparent hover:decoration-primary decoration-2 underline-offset-4"
            >
              {isLogin ? 'Sign up now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
