import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'si' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    home: "Home",
    movies: "Movies",
    tvSeries: "TV Series",
    watchlist: "Watchlist",
    account: "Account",
    searchPlaceholder: "Type to search...",
    trendingNow: "Trending Now",
    popularMovies: "Popular Movies",
    popularTV: "Popular TV Shows",
    settings: "Settings",
    signOut: "Sign Out",
    myWatchlist: "My Watchlist",
    memberSince: "Member since",
    accountStatus: "Account Status",
    activeMember: "Active Member",
    saveChanges: "Save Changes",
    uploading: "Uploading...",
    username: "Username",
    profilePicture: "Profile Picture",
    selectLanguage: "Select Language",
    cancel: "Cancel",
    save: "Save",
    exploreAll: "Explore All"
  },
  si: {
    home: "මුල් පිටුව",
    movies: "චිත්‍රපට",
    tvSeries: "ටෙලි කතාමාලා",
    watchlist: " නැරඹුම් ලැයිස්තුව",
    account: "ගිණුම",
    searchPlaceholder: "සොයන්න...",
    trendingNow: "දැන් ජනප්‍රිය",
    popularMovies: "ජනප්‍රිය චිත්‍රපට",
    popularTV: "ජනප්‍රිය ටෙලි කතා",
    settings: "සකසුම්",
    signOut: "ඉවත් වන්න",
    myWatchlist: "මගේ ලැයිස්තුව",
    memberSince: "සාමාජිකත්වය",
    accountStatus: "ගිණුමේ තත්ත්වය",
    activeMember: "සක්‍රීය සාමාජික",
    saveChanges: "වෙනස්කම් සුරකින්න",
    uploading: "උඩුගත කරමින්...",
    username: "පරිශීලක නාමය",
    profilePicture: "පළමු රූපය",
    selectLanguage: "භාෂාව තෝරන්න",
    cancel: "අවලංගු කරන්න",
    save: "සුරකින්න",
    exploreAll: "සියල්ල බලන්න"
  },
  ta: {
    home: "முகப்பு",
    movies: "திரைப்படங்கள்",
    tvSeries: "தொலைக்காட்சி தொடர்கள்",
    watchlist: "விருப்பப் பட்டியல்",
    account: "கணக்கு",
    searchPlaceholder: "தேடு...",
    trendingNow: "இப்போது பிரபலமானது",
    popularMovies: "பிரபலமான திரைப்படங்கள்",
    popularTV: "பிரபலமான தொலைக்காட்சி நிகழ்ச்சிகள்",
    settings: "அமைப்புகள்",
    signOut: "வெளியேறு",
    myWatchlist: "எனது பட்டியல்",
    memberSince: "உறுப்பினர்",
    accountStatus: "கணக்கு நிலை",
    activeMember: "செயலில் உள்ள உறுப்பினர்",
    saveChanges: "மாற்றங்களை சேமி",
    uploading: "பதிவேற்றப்படுகிறது...",
    username: "பயனர்பெயர்",
    profilePicture: "சுயவிவரப் படம்",
    selectLanguage: "மொழியைத் தேர்ந்தெடுங்கள்",
    cancel: "ரத்துசெய்",
    save: "சேமி",
    exploreAll: "அனைத்தையும் பார்"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};