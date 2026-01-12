import React from 'react';
import { X, Download, Monitor, Music, FileVideo, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DownloadFormat } from '../services/downloadService';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  formats: DownloadFormat[];
  title: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, formats, title }) => {
  if (!isOpen) return null;

  // Group formats
  const videoFormats = formats.filter(f => !f.isAudioOnly);
  const audioFormats = formats.filter(f => f.isAudioOnly);

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-[#1a1a1a] p-6 border-b border-gray-700 flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download size={24} className="text-primary" />
                    Lanka Cinema Server
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-1 opacity-80">{title}</p>
            </div>
            <button onClick={onClose} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">
            
            {formats.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={32} />
                    <p>No direct download links available for this content.</p>
                </div>
            ) : (
                <>
                    {/* Video Section */}
                    {videoFormats.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                <Monitor size={14} /> Video Formats
                            </h4>
                            <div className="grid gap-3">
                                {videoFormats.map((fmt, idx) => (
                                    <button
                                        key={`v-${idx}`}
                                        onClick={() => handleDownload(fmt.url)}
                                        className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-primary/50 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-white">
                                                <FileVideo size={20} />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-white font-bold text-sm">{fmt.quality}</span>
                                                <span className="block text-xs text-gray-500 uppercase">{fmt.container} • {fmt.size}</span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                                            Download
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Audio Section */}
                    {audioFormats.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                <Music size={14} /> Audio Only
                            </h4>
                            <div className="grid gap-3">
                                {audioFormats.map((fmt, idx) => (
                                    <button
                                        key={`a-${idx}`}
                                        onClick={() => handleDownload(fmt.url)}
                                        className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/50 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-white">
                                                <Music size={20} />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-white font-bold text-sm">Audio Track</span>
                                                <span className="block text-xs text-gray-500 uppercase">{fmt.container} • {fmt.size}</span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                                            Download
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Links provided securely via Lanka Cinema High-Speed Servers</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;