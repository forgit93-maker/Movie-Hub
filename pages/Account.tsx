import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Settings, Camera, X, Loader, CheckCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { uploadImageToImgBB } from '../services/imgbb';

const Account: React.FC = () => {
  const { user, logout } = useStore();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Form State
  const [username, setUsername] = useState(user?.username || '');
  const [selectedLang, setSelectedLang] = useState<'en' | 'si' | 'ta'>(language);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const checkUsernameExists = async (u: string) => {
    if (u === user?.username) return false; // Same as current
    const q = query(collection(db, "users"), where("username", "==", u));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!user) throw new Error("No user found");

      // 1. Check Username Uniqueness
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw new Error("Username already taken. Please choose another.");
      }

      // 2. Upload Image if changed
      let photoURL = user.photoURL;
      if (selectedFile) {
        photoURL = await uploadImageToImgBB(selectedFile);
      }

      // 3. Update Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        username: username,
        profilePic: photoURL,
        language: selectedLang
      });

      // 4. Update Local Language Context
      if (selectedLang !== language) {
        setLanguage(selectedLang);
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSuccess(null);
        // Optional: Refresh page or rely on Firestore snapshot listener in StoreContext to update UI
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-6 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up relative">
        
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-primary to-red-900 relative">
          {/* Settings Button */}
          <button 
            onClick={() => {
              setUsername(user.username);
              setSelectedLang(user.language || 'en');
              setPreviewUrl(null);
              setIsSettingsOpen(true);
            }}
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gray-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden">
               {user.photoURL ? (
                 <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
               ) : (
                 user.username[0].toUpperCase()
               )}
            </div>
          </div>

          {/* User Info - Display Username */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">@{user.username}</h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
            <Mail size={16} className="mr-2" />
            {user.email}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-black/40 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-bold mb-1">{t('accountStatus')}</h3>
              <p className="text-green-500 text-sm font-medium flex items-center">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                 {t('activeMember')}
              </p>
              <p className="text-gray-500 text-xs mt-2">{t('memberSince')} 2024</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-600 hover:text-white dark:hover:bg-red-600 border border-transparent py-3 rounded-lg font-bold transition-all duration-200"
            >
              <LogOut size={20} />
              <span>{t('signOut')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 overflow-y-auto space-y-6">
              
              {/* Profile Pic Upload */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full bg-gray-800 mb-4 overflow-hidden border-2 border-gray-700">
                   <img 
                      src={previewUrl || user.photoURL || `https://ui-avatars.com/api/?name=${user.username}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                   />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Camera className="text-white" size={32} />
                   </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary text-sm font-bold hover:underline">
                  Change Profile Picture
                </button>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('username')}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-3 text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                  placeholder="unique_username"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be unique.</p>
              </div>

              {/* Language Select */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('selectLanguage')}</label>
                <div className="grid grid-cols-3 gap-3">
                   <button 
                     type="button"
                     onClick={() => setSelectedLang('en')}
                     className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'en' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}
                   >
                     English
                   </button>
                   <button 
                     type="button"
                     onClick={() => setSelectedLang('si')}
                     className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'si' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}
                   >
                     සිංහල
                   </button>
                   <button 
                     type="button"
                     onClick={() => setSelectedLang('ta')}
                     className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'ta' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}
                   >
                     தமிழ்
                   </button>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> {success}
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3 bg-primary text-white rounded font-bold hover:bg-red-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader className="animate-spin" size={20} /> : t('saveChanges')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;