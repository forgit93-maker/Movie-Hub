import React from 'react';
import { X, Type, Check, Monitor, Smartphone, Wifi, Download, Layers, Settings2, Palette, ShieldCheck } from 'lucide-react';
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
                    <span className="text-lg">Download Manager</span>
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
                    <div className="flex flex-col items-center justify-center py-16 space-y-8 bg-black/20 rounded-xl border border-dashed border-gray-800">
                        <div className="relative">
                             {/* Premium Spinner */}
                            <div className="w-20 h-20 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Download size={28} className="text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-white font-bold text-xl tracking-tight">Generating Link...</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                               <ShieldCheck size={12} />
                               <span>Secure High-Speed Connection</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Select Quality</p>
                            {downloadQualities.map((quality, idx) => (
                            <button
                                key={idx}
                                onClick={() => onDownload(quality.id)}
                                className="relative flex items-center justify-between p-4 rounded-xl bg-gray-800/40 border border-gray-700 hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300 group active:scale-[0.98] overflow-hidden"
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`p-3 rounded-full bg-black/40 text-gray-400 group-hover:text-white transition shadow-inner border border-white/5`}>
                                        <quality.icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-white font-bold text-lg leading-tight">{quality.label}</span>
                                        <span className="block text-gray-500 text-xs font-medium uppercase mt-1">MP4 • Direct Link</span>
                                    </div>
                                </div>
                                <span className={`relative z-10 text-[10px] font-black px-2 py-1 rounded bg-gradient-to-r ${quality.color} text-white shadow-lg tracking-wide`}>
                                    {quality.badge}
                                </span>
                            </button>
                            ))}
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                            <div className="shrink-0 pt-0.5">
                                <ShieldCheck size={16} className="text-blue-400" />
                            </div>
                            <p className="text-[11px] leading-relaxed text-blue-200/80">
                                <strong className="text-blue-200">Pro Tip:</strong> Use the 1080p option for the best balance between quality and file size on mobile devices.
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