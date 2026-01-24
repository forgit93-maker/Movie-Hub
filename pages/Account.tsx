import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Settings, Camera, X, Loader, CheckCircle, Bell, ChevronRight, Calendar, Radio } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { uploadImageToImgBB } from '../services/imgbb';
import { tmdbService, getImageUrl } from '../services/tmdb';

// VAPID Public Key
const VAPID_PUBLIC_KEY = "BEuf_Qip6JQ43vDuDfHUI1QhNphZPcMzIQqvdDPur1rUouUb95y7QyTcMIMvXs4nWM8gzCHLxF4KZiAe3d5qdko";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface NotificationItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string;
  date: string;
  message: string;
  isRead: boolean;
}

const Account: React.FC = () => {
  const { user, logout } = useStore();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');

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

  // --- Automated Notification Logic ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const trending = await tmdbService.getTrending('all', 'day');
        const recentItems = trending.slice(0, 5); 
        
        const readIds = JSON.parse(localStorage.getItem('moviehub_read_notifications') || '[]');
        
        const generatedNotifications: NotificationItem[] = recentItems.map(item => {
           const notifId = `${item.media_type}-${item.id}`;
           const isMovie = item.media_type === 'movie';
           return {
             id: notifId,
             tmdbId: Number(item.id),
             type: item.media_type as 'movie' | 'tv',
             title: item.title || item.name || 'Unknown',
             poster: item.poster_path || '',
             date: item.release_date || item.first_air_date || '',
             message: isMovie 
                ? `Premiere Alert: "${item.title || item.name}" is now streaming!` 
                : `New Episode: "${item.title || item.name}" has just been added.`,
             isRead: readIds.includes(notifId)
           };
        });

        setNotifications(generatedNotifications);
        setUnreadCount(generatedNotifications.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const toggleNotifications = () => {
    if (!isNotificationsOpen) {
      const allIds = notifications.map(n => n.id);
      const uniqueIds = Array.from(new Set([...JSON.parse(localStorage.getItem('moviehub_read_notifications') || '[]'), ...allIds]));
      localStorage.setItem('moviehub_read_notifications', JSON.stringify(uniqueIds));
      
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  
  const handleNotificationClick = (notif: NotificationItem) => {
    navigate(`/details/${notif.type}/${notif.tmdbId}`);
  };

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

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications are not supported by your browser.");
      return;
    }

    try {
      // Explicitly register /sw.js at the root scope
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      
      // Wait for the service worker to be active
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Avoid JSON.stringify on complex objects in production logs
      console.log('Push Subscription Active:', subscription.endpoint);
      setPushEnabled(true);
      alert("Notifications enabled successfully! You will receive updates for new releases.");
      
      // Note: In a production app, send 'subscription' to your backend here.

    } catch (err: any) {
      // Prevent circular JSON error when logging complex error objects
      const errorMessage = err?.message || String(err);
      console.error('Failed to subscribe to push:', errorMessage);
      
      if (errorMessage.includes('scriptURL') || errorMessage.includes('MIME type')) {
        alert("Configuration Error: The Service Worker script could not be loaded. Please ensure 'sw.js' is in the public folder.");
      } else {
        alert("Failed to enable notifications. Please check your browser permission settings.");
      }
    }
  };

  const checkUsernameExists = async (u: string) => {
    if (u === user?.username) return false; 
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
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw new Error("Username already taken. Please choose another.");
      }
      let photoURL = user.photoURL;
      if (selectedFile) {
        photoURL = await uploadImageToImgBB(selectedFile);
      }
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        username: username,
        profilePic: photoURL,
        language: selectedLang
      });
      if (selectedLang !== language) {
        setLanguage(selectedLang);
      }
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSuccess(null);
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
        
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-primary to-red-900 relative transition-all duration-500">
          <button 
            onClick={toggleNotifications}
            className={`absolute top-4 right-16 p-2 rounded-full text-white transition-colors active:scale-95 ${isNotificationsOpen ? 'bg-white text-primary' : 'bg-black/30 hover:bg-black/50'}`}
          >
            <Bell size={20} className={isNotificationsOpen ? "fill-current" : ""} />
            {unreadCount > 0 && !isNotificationsOpen && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-primary rounded-full animate-pulse"></span>
            )}
          </button>

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
        
        <div className="relative bg-gray-50 dark:bg-gray-900 min-h-[360px]">
          {isNotificationsOpen ? (
            <div className="absolute inset-0 z-10 animate-fade-in flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100 dark:bg-gray-800/50">
                 <h2 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                   <Bell size={16} className="text-primary"/> New Arrivals
                 </h2>
                 <button onClick={toggleNotifications} className="text-xs text-gray-500 hover:text-primary font-bold">Close</button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                 {notifications.length === 0 ? (
                   <div className="text-center py-10 text-gray-500 text-sm">No new updates right now.</div>
                 ) : (
                   notifications.map((notif) => (
                     <div 
                       key={notif.id} 
                       onClick={() => handleNotificationClick(notif)}
                       className="flex items-center gap-3 p-3 bg-white dark:bg-black/40 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 cursor-pointer transition-all active:scale-98 group"
                     >
                        <img 
                          src={getImageUrl(notif.poster, 'w500')} 
                          alt={notif.title} 
                          className="w-12 h-16 object-cover rounded-md shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                           <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{notif.title}</h4>
                           <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">{notif.message}</p>
                           <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded uppercase">{notif.type}</span>
                              <span className="text-[9px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> {notif.date}</span>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 dark:text-gray-700 group-hover:text-primary" />
                     </div>
                   ))
                 )}
              </div>
            </div>
          ) : (
            <div className="px-8 pb-8 animate-fade-in">
              <div className="relative -mt-12 mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gray-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
                   ) : (
                     user.username[0].toUpperCase()
                   )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">@{user.username}</h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
                <Mail size={16} className="mr-2" />
                {user.email}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-black/40 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-gray-900 dark:text-white font-bold">{t('accountStatus')}</h3>
                     {!pushEnabled && (
                       <button 
                         onClick={subscribeToPush}
                         className="text-[10px] font-bold bg-primary text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-700 transition"
                       >
                         <Radio size={12} /> Enable Alerts
                       </button>
                     )}
                  </div>
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
          )}
        </div>
      </div>

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
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full bg-gray-800 mb-4 overflow-hidden border-2 border-gray-700">
                   <img src={previewUrl || user.photoURL || `https://ui-avatars.com/api/?name=${user.username}`} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Camera className="text-white" size={32} />
                   </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary text-sm font-bold hover:underline">Change Profile Picture</button>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('username')}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-3 text-gray-900 dark:text-white focus:border-primary focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('selectLanguage')}</label>
                <div className="grid grid-cols-3 gap-3">
                   <button type="button" onClick={() => setSelectedLang('en')} className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'en' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}>English</button>
                   <button type="button" onClick={() => setSelectedLang('si')} className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'si' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}>සිංහල</button>
                   <button type="button" onClick={() => setSelectedLang('ta')} className={`py-2 px-3 rounded text-sm font-medium border ${selectedLang === 'ta' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'}`}>தமிழ்</button>
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center">{error}</div>}
              {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded text-sm text-center flex items-center justify-center gap-2"><CheckCircle size={16} /> {success}</div>}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition">{t('cancel')}</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-primary text-white rounded font-bold hover:bg-red-700 transition flex items-center justify-center disabled:opacity-50">{isLoading ? <Loader className="animate-spin" size={20} /> : t('saveChanges')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;