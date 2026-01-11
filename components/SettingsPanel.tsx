import React from 'react';
import { X, Type, Check, Monitor, Smartphone, Wifi, Download, Layers, Settings2, Palette } from 'lucide-react';
import { SubtitleStyle } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  mode: 'subtitles' | 'download';
  onClose: () => void;
  style: SubtitleStyle;
  onStyleChange: (newStyle: SubtitleStyle) => void;
  onDownload: (quality: string) => void;
  isGeneratingLink: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  mode,
  onClose, 
  style, 
  onStyleChange,
  onDownload,
  isGeneratingLink
}) => {
  if (!isOpen) return null;

  const colors = ['#ffffff', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6', '#ef4444', '#fcd34d', '#86efac', '#93c5fd', '#d8b4fe', '#fca5a5', '#cbd5e1'];
  
  const handlePresetChange = (type: 'outline' | 'semi' | 'box') => {
    let newStyle = { ...style };
    if (type === 'outline') {
      newStyle.backgroundColor = 'transparent';
      newStyle.hasShadow = true;
    } else if (type === 'semi') {
      newStyle.backgroundColor = 'rgba(0,0,0,0.5)';
      newStyle.hasShadow = false;
    } else if (type === 'box') {
      newStyle.backgroundColor = 'black';
      newStyle.hasShadow = false;
    }
    onStyleChange(newStyle);
  };

  const downloadQualities = [
    { label: '4K Ultra HD', id: '4k', icon: Monitor, color: 'from-purple-600 to-pink-600', badge: 'ULTRA' },
    { label: 'Full HD (1080p)', id: '1080p', icon: Monitor, color: 'from-blue-600 to-cyan-600', badge: 'HD' },
    { label: 'HD Ready (720p)', id: '720p', icon: Wifi, color: 'from-green-600 to-emerald-600', badge: 'HD' },
    { label: 'Standard (480p)', id: '480p', icon: Smartphone, color: 'from-yellow-600 to-orange-600', badge: 'SD' },
  ];

  return (
    <div className="w-full mt-4 bg-[#1a1a1a] border border-gray-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2 text-white font-bold">
            {mode === 'subtitles' ? (
                <>
                    <Settings2 size={20} className="text-primary" />
                    <span className="text-lg">Subtitle Settings</span>
                </>
            ) : (
                <>
                    <Download size={20} className="text-blue-500" />
                    <span className="text-lg">Download Quality</span>
                </>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area - FIXED HEIGHT FOR MOBILE */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-6 bg-[#111]">
          
          {/* --- MODE: SUBTITLES --- */}
          {mode === 'subtitles' && (
              <div className="space-y-8">
                {/* 1. Font Color Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Palette size={14} /> Font Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => onStyleChange({ ...style, color })}
                        className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                          style.color === color ? 'border-white ring-2 ring-primary ring-offset-2 ring-offset-[#111]' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {style.color === color && <Check size={14} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Size Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                    <span className="flex items-center gap-2"><Type size={14}/> Font Size</span>
                    <span className="text-primary">{style.fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="40" 
                    step="2"
                    value={style.fontSize}
                    onChange={(e) => onStyleChange({ ...style, fontSize: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600">
                      <span>Small</span>
                      <span>Large</span>
                  </div>
                </div>

                {/* 3. Background Style Buttons */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                     <Layers size={14} /> Background Style
                   </label>
                   <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => handlePresetChange('outline')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${
                          style.backgroundColor === 'transparent' && style.hasShadow 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Type size={18} /> Outline
                      </button>
                      <button 
                        onClick={() => handlePresetChange('semi')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${
                          style.backgroundColor === 'rgba(0,0,0,0.5)' 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Layers size={18} /> Semi-Box
                      </button>
                      <button 
                        onClick={() => handlePresetChange('box')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${
                          style.backgroundColor === 'black' 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Settings2 size={18} /> Solid Box
                      </button>
                   </div>
                </div>
              </div>
          )}

          {/* --- MODE: DOWNLOAD --- */}
          {mode === 'download' && (
              <div className="space-y-6">
                {isGeneratingLink ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Download size={24} className="text-primary" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg mb-1">Generating Link...</p>
                            <p className="text-sm text-gray-500">Connecting to High-Speed Secure Server</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3">
                            {downloadQualities.map((quality, idx) => (
                            <button
                                key={idx}
                                onClick={() => onDownload(quality.id)}
                                className="relative flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-200 group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-black/40 text-gray-400 group-hover:text-white transition shadow-inner`}>
                                    <quality.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-white font-bold text-base">{quality.label}</span>
                                    <span className="block text-gray-500 text-xs uppercase mt-0.5">High Speed • Direct</span>
                                </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-gradient-to-r ${quality.color} text-white shadow-lg`}>
                                    {quality.badge}
                                </span>
                            </button>
                            ))}
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-[10px] text-center text-blue-300">
                                Note: Downloads are powered by rapid secure servers. Pop-ups may occur depending on the source.
                            </p>
                        </div>
                    </>
                )}
              </div>
          )}

        </div>
    </div>
  );
};

export default SettingsPanel;