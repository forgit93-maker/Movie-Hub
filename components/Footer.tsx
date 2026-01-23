import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Music2, Mail, X, Shield, FileText, Info } from 'lucide-react';

const triggerPopunder = () => {
  const SCRIPT_URL = 'https://awkwardmonopoly.com/54/42/28/544228badfcc4c2bfc0469db956fed8d.js';
  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }
};

const AdzillaBanner: React.FC<{ id: string }> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const configScript = document.createElement('script');
      configScript.text = `
        atOptions = {
          'key' : 'ea20c69b1277b26784f01cb5700280b3',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      const invokeScript = document.createElement('script');
      invokeScript.src = 'https://awkwardmonopoly.com/ea20c69b1277b26784f01cb5700280b3/invoke.js';
      invokeScript.async = true;
      containerRef.current.appendChild(configScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="flex justify-center w-full min-h-[95px] my-6 overflow-hidden">
      <div 
        ref={containerRef}
        id={`adzilla-container-${id}`}
        className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded"
      >
        <span className="text-[10px] text-gray-400 dark:text-gray-800 font-bold uppercase tracking-widest animate-pulse italic">Partner Feed Loading...</span>
      </div>
    </div>
  );
};

interface LegalModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, isOpen, onClose, children, icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-3 text-primary">
            {icon}
            <h2 className="text-xl font-black uppercase tracking-widest italic">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all text-gray-500 dark:text-white/60">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 custom-scrollbar text-sm md:text-base">
          {children}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-white/5 text-center">
          <button onClick={onClose} className="px-10 py-2.5 bg-primary text-white font-bold rounded-full text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Confirm Awareness</button>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const location = useLocation();
  const [modal, setModal] = useState<'none' | 'dmca' | 'tos' | 'privacy'>('none');
  
  const hideFooter = ['/profile', '/watchlist', '/account', '/favorites'].includes(location.pathname);
  if (hideFooter) return null;

  return (
    <footer className="bg-white dark:bg-black text-gray-500 border-t border-gray-200 dark:border-white/10 pt-10 md:pt-16 pb-28 transition-colors">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Adzilla Placement: Primary Banner */}
        <AdzillaBanner id="global-footer-adzilla" />

        <div className="mb-10 flex flex-col items-center">
          {/* Logo Branding */}
          <Link to="/" onClick={triggerPopunder} className="text-primary font-black text-3xl md:text-4xl tracking-tighter inline-block mb-8 hover:scale-105 transition-transform active:scale-95">
            MOVIE HUB
          </Link>
          
          {/* Social Icons Hub - Updated Links */}
          <div className="flex justify-center space-x-8 md:space-x-10 mb-10">
            <a href="https://www.facebook.com/share/1D8xGfpQoY/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-125"><Facebook size={24} /></a>
            <a href="https://www.instagram.com/movie_hub.lk?igsh=OW54ZDV5dnI1Z3ow" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-125"><Instagram size={24} /></a>
            <a href="https://youtube.com/@movie_master-2.0.0?si=EbMfWxB8PITo6TOQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-125"><Youtube size={24} /></a>
            <a href="https://www.tiktok.com/@movie_hub_lk?_r=1&_t=ZS-93FY5uB6VvB" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-125"><Music2 size={24} /></a>
          </div>

          {/* Legal Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <button onClick={() => { triggerPopunder(); setModal('dmca'); }} className="hover:text-primary transition-colors hover:underline underline-offset-4">DMCA Notice</button>
            <button onClick={() => { triggerPopunder(); setModal('tos'); }} className="hover:text-primary transition-colors hover:underline underline-offset-4">Terms of Service</button>
            <button onClick={() => { triggerPopunder(); setModal('privacy'); }} className="hover:text-primary transition-colors hover:underline underline-offset-4">Privacy Shield</button>
          </div>

          {/* Contact Us (Auto-Email Mailto Link) */}
          <a 
            href="mailto:Masterhub206@gmail.com" 
            onClick={triggerPopunder}
            className="inline-flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase text-gray-500 hover:text-primary transition-all bg-gray-100 dark:bg-white/5 px-7 md:px-10 py-3.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm active:scale-90 transform"
          >
            <Mail size={14} className="text-primary" /> Contact Us
          </a>
        </div>

        <div className="space-y-5 md:space-y-7">
          {/* Copyright Metadata */}
          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            &copy; 2026 MOVIE HUB INFOTAINMENT &bull; ALL TRANSMISSION RIGHTS RESERVED.
          </p>

          {/* Powered By MASTER-MD (Cinematic Gold Aesthetic) */}
          <p className="text-[12px] md:text-[15px] font-black text-yellow-600 dark:text-yellow-500 tracking-[0.5em] uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            POWERED BY MASTER-MD
          </p>
        </div>
      </div>

      {/* Legal Content Overlays */}
      <LegalModal 
        title="DMCA Policy" 
        isOpen={modal === 'dmca'} 
        onClose={() => setModal('none')} 
        icon={<Shield size={24} />}
      >
        <p className="font-bold text-gray-900 dark:text-white">Content Indexing Disclaimer:</p>
        <p>MOVIE HUB operates exclusively as a link indexer. Our platform provides automated links to content hosted on third-party, external hosting services. <strong>We do not host, store, upload, or own any video files on our local servers.</strong></p>
        <p className="font-bold text-gray-900 dark:text-white mt-4">Take-down Requests:</p>
        <p>We strictly comply with intellectual property laws. If you are the legal owner of material indexed here and wish for its removal, please email <span className="text-primary font-bold underline">Masterhub206@gmail.com</span> with specific URLs. Valid requests are typically addressed within 24-48 hours.</p>
      </LegalModal>

      <LegalModal 
        title="Terms of Service" 
        isOpen={modal === 'tos'} 
        onClose={() => setModal('none')} 
        icon={<FileText size={24} />}
      >
        <p className="font-bold text-gray-900 dark:text-white">Usage & Liability:</p>
        <p>MOVIE HUB is provided on an "as-is" basis for personal, non-commercial entertainment purposes. We act as a conduit to third-party content and are not responsible for the legality, accuracy, or quality of external hosting providers.</p>
        <p className="mt-4">By utilizing this hub, you agree that MOVIE HUB is not liable for technical interruptions or content-specific behaviors of indexed links.</p>
      </LegalModal>

      <LegalModal 
        title="Privacy Policy" 
        isOpen={modal === 'privacy'} 
        onClose={() => setModal('none')} 
        icon={<Info size={24} />}
      >
        <p className="font-bold text-gray-900 dark:text-white">Data Protection:</p>
        <p>We prioritize your anonymity. MOVIE HUB does not collect or store personal identifying data from its visitors. We use secure logging only for technical performance and security auditing.</p>
        <p className="font-bold text-gray-900 dark:text-white mt-4">Cookies & Advertising:</p>
        <p>Our advertising partner, <span className="font-bold">Adzilla</span>, may use cookies to deliver regionalized content and analyze basic traffic metrics. These cookies do not store sensitive user details.</p>
      </LegalModal>
    </footer>
  );
};

export default Footer;