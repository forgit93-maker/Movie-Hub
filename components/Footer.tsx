import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, X as XIcon } from 'lucide-react';

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (type: string) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <footer className="bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-white/10 transition-colors duration-300 pb-28">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="text-primary font-bold text-3xl tracking-tighter block">
              MOVIE HUB
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The ultimate destination for movie lovers. Discover, track, and watch trailers of your favorite movies and TV shows.
            </p>
            <div className="flex space-x-4 pt-2">
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
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => openModal('dmca')} className="hover:text-primary transition-colors text-left">
                  DMCA
                </button>
              </li>
              <li>
                <button onClick={() => openModal('terms')} className="hover:text-primary transition-colors text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => openModal('privacy')} className="hover:text-primary transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Disclaimer</h3>
            <div className="mt-2 text-xs text-gray-500">
               <p className="leading-relaxed">
                 MOVIE HUB does not host any files. We link to 3rd party servers.
               </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 dark:border-white/10 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>&copy; 2026 MOVIE HUB All Rights Reserved. Powered By MASTER-MD</p>
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
              <div className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed">
                 {activeModal === 'terms' && (
                   <>
                     <p>Welcome to MOVIE HUB. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
                     <p><strong>Content Disclaimer:</strong> MOVIE HUB acts as a search index for movie and TV series information. We do not host any content on our servers. All video content is provided by non-affiliated third-party servers/APIs. We have no control over the content hosted on these external servers.</p>
                   </>
                 )}
                 {activeModal === 'privacy' && (
                   <>
                     <p>Your privacy is important to us. This Privacy Policy explains how we collect and use your information.</p>
                     <p><strong>Data Collection:</strong> We do not collect personal data such as names, addresses, or phone numbers unless explicitly provided by you (e.g., during optional account signup).</p>
                     <p><strong>Third-Party Services:</strong> We use third-party services like TMDB for data and YouTube for trailers. These services may collect their own data subject to their respective privacy policies.</p>
                   </>
                 )}
                 {activeModal === 'dmca' && (
                   <>
                     <p>MOVIE HUB respects the intellectual property rights of others.</p>
                     <p><strong>Disclaimer:</strong> MOVIE HUB does not host any files on its server. All content is provided by non-affiliated third parties.</p>
                     <p>If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on this site, please notify our copyright agent.</p>
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