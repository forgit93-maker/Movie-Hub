
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube, X as XIcon, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const location = useLocation();
  const bannerRef = useRef<HTMLDivElement>(null);

  const openModal = (type: string) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  // 1. Hide Footer completely on Account (/profile) and Favorites (/watchlist) pages
  const hideFooter = ['/profile', '/watchlist', '/account', '/favorites'].includes(location.pathname);
  
  // --- ADSTERRA 728x90 FOOTER INJECTION ---
  useEffect(() => {
    if (bannerRef.current) {
        bannerRef.current.innerHTML = ''; // Clear previous to prevent duplicates

        // 1. Create Label
        const label = document.createElement('div');
        label.className = "text-[10px] text-gray-500 uppercase tracking-widest mb-2";
        label.innerText = "Advertisement";
        bannerRef.current.appendChild(label);

        // 2. Create Ad Wrapper
        const adWrapper = document.createElement('div');
        bannerRef.current.appendChild(adWrapper);

        // 3. Config Script
        const confScript = document.createElement('script');
        confScript.type = 'text/javascript';
        confScript.innerHTML = `
            atOptions = {
                'key' : 'ea20c69b1277b26784f01cb5700280b3',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
            };
        `;
        adWrapper.appendChild(confScript);

        // 4. Invoke Script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = "//awkwardmonopoly.com/ea20c69b1277b26784f01cb5700280b3/invoke.js";
        adWrapper.appendChild(invokeScript);
    }
  }, [hideFooter]); // Re-run if footer visibility changes

  if (hideFooter) return null;

  // 2. Only show Intro text and Social Icons on the Home page ('/')
  const showIntro = location.pathname === '/';

  return (
    <footer className="bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-white/10 transition-colors duration-300 pb-28 pt-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* --- ADSTERRA BANNER CONTAINER --- */}
        <div ref={bannerRef} className="flex flex-col items-center justify-center mb-10 overflow-hidden min-h-[100px]">
           {/* Scripts injected here via useEffect */}
        </div>

        {/* Brand & Socials Section */}
        <div className="mb-8">
            <Link to="/" className="text-primary font-bold text-3xl tracking-tighter inline-block mb-4">
              MOVIE HUB
            </Link>
            
            {showIntro && (
              <div className="flex justify-center space-x-6 mb-6">
                <a href="https://www.facebook.com/share/1Aa1vJ3hJk/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-gray-900 dark:text-white">
                  <Facebook size={20} />
                </a>
                <a href="https://www.instagram.com/nethsarachadeepa?igsh=MTRkY2NvZXEza2Z1dg==" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-gray-900 dark:text-white">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com/@movie_master-2.0.0?si=W_C5RAWqejGMTeEv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-gray-900 dark:text-white">
                  <Youtube size={20} />
                </a>
                <a href="https://www.tiktok.com/@movie_hub_lk?_r=1&_t=ZS-92IeqpEMyYL_" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-gray-900 dark:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                </a>
              </div>
            )}
        </div>

        {/* Legal Links (Centered Row) */}
        <div className="flex justify-center space-x-6 text-sm mb-10 border-b border-gray-200 dark:border-white/5 pb-8">
            <button onClick={() => openModal('dmca')} className="hover:text-primary transition-colors">DMCA</button>
            <button onClick={() => openModal('terms')} className="hover:text-primary transition-colors">Terms of Service</button>
            <button onClick={() => openModal('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
        </div>

        {/* The 3 Requested Distinct Lines */}
        <div className="space-y-4">
            {/* Line 1: Contact Email */}
            <div className="flex justify-center">
                <a 
                  href="mailto:Masterhub206@gmail.com" 
                  className="inline-flex items-center text-gray-500 hover:text-primary transition-colors gap-2 group font-medium"
                >
                  <Mail size={18} className="group-hover:animate-bounce" /> 
                  Contact Us
                </a>
            </div>

            {/* Line 2: Copyright */}
            <p className="text-xs text-gray-500">
              &copy; 2026 MOVIE HUB All Rights Reserved.
            </p>

            {/* Line 3: Powered By */}
            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-500 tracking-wide">
              Powered By MASTER-MD
            </p>
        </div>
      </div>

      {/* Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
           <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeModal === 'terms' && 'Terms of Service'}
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'dmca' && 'DMCA Disclaimer'}
                 </h2>
                 <button onClick={closeModal} className="text-gray-500 hover:text-primary transition-colors">
                    <XIcon size={24} />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed text-left">
                 {activeModal === 'terms' && (
                   <>
                     <p>Welcome to MOVIE HUB. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
                     <p><strong>Content Disclaimer:</strong> MOVIE HUB acts as a search index for movie and TV series information. We do not host any content on our servers. All video content is provided by non-affiliated third-party servers/APIs.</p>
                   </>
                 )}
                 {activeModal === 'privacy' && (
                   <>
                     <p>Your privacy is important to us.</p>
                     <p><strong>Data Collection:</strong> We do not collect personal data such as names, addresses, or phone numbers unless explicitly provided by you.</p>
                   </>
                 )}
                 {activeModal === 'dmca' && (
                   <>
                     <p>MOVIE HUB respects the intellectual property rights of others.</p>
                     <p><strong>Disclaimer:</strong> MOVIE HUB does not host any files on its server. All content is provided by non-affiliated third parties.</p>
                   </>
                 )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex justify-end">
                 <button onClick={closeModal} className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-red-700 transition">
                    Close
                 </button>
              </div>
           </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
