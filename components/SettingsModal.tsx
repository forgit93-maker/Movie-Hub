import React, { useState, useEffect } from 'react';
import { X, Type, Check, Monitor, Smartphone, Wifi, Download, Layers, Settings2, Server } from 'lucide-react';
import { SubtitleStyle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: SubtitleStyle;
  onStyleChange: (newStyle: SubtitleStyle) => void;
  initialTab?: 'quality' | 'subtitles';
  onDownload: (server: 'primary' | 'backup') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  style, 
  onStyleChange,
  initialTab = 'subtitles',
  onDownload
}) => {
  const [activeTab, setActiveTab] = useState<'quality' | 'subtitles'>(initialTab);

  // Sync internal tab state with prop when opening
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const colors = ['#ffffff', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6', '#ef4444'];
  
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
    { label: '4K Ultra HD', resolution: '2160p', icon: Monitor, color: 'from-purple-600 to-pink-600', badge: 'ULTRA' },
    { label: 'Full HD', resolution: '1080p', icon: Monitor, color: 'from-blue-600 to-cyan-600', badge: 'HD' },
    { label: 'HD Ready', resolution: '720p', icon: Wifi, color: 'from-green-600 to-emerald-600', badge: 'HD' },
    { label: 'Standard', resolution: '480p', icon: Smartphone, color: 'from-yellow-600 to-orange-600', badge: 'SD' },
  ];

  return (
    <div className="absolute inset-0 z-[1001] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal / Panel Container */}
      <div className="relative z-10 bg-[#1a1a1a] w-full md:max-w-md md:rounded-xl rounded-t-2xl border-t md:border border-gray-700 shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh] md:max-h-[600px]">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('subtitles')}
              className={`flex items-center gap-2 pb-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subtitles' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              <Type size={16} /> Subtitles
            </button>
            <button 
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 pb-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'quality' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              <Download size={16} /> Downloads
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full"
            title="Close Settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* QUALITY TAB */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 uppercase font-bold mb-2">Select Resolution to Download</p>
              
              <div className="space-y-3">
                {downloadQualities.map((quality, idx) => (
                  <button
                    key={idx}
                    onClick={() => onDownload('primary')}
                    className="w-full relative flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-black/40 text-gray-300 group-hover:text-white transition`}>
                         <quality.icon size={20} />
                      </div>
                      <div className="text-left">
                         <span className="block text-white font-bold text-sm">{quality.resolution}</span>
                         <span className="block text-gray-500 text-[10px]">{quality.label}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded bg-gradient-to-r ${quality.color} text-white shadow-lg`}>
                        {quality.badge}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 mt-2">
                 <p className="text-xs text-gray-400 uppercase font-bold mb-2">Backup Link</p>
                 <button 
                    onClick={() => onDownload('backup')}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                 >
                    <Server size={16} /> Use 2Embed Server
                 </button>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200 text-center">
                 Download links are generated dynamically via secure high-speed nodes.
              </div>
            </div>
          )}

          {/* SUBTITLES TAB */}
          {activeTab === 'subtitles' && (
            <div className="space-y-6">
              {/* 1. Color Picker */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Font Color</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onStyleChange({ ...style, color })}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                        style.color === color ? 'border-white ring-2 ring-primary ring-offset-2 ring-offset-[#1a1a1a]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {style.color === color && <Check size={16} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Size Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-3">
                  <span>Font Size</span>
                  <span className="text-primary">{style.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="40" 
                  step="2"
                  value={style.fontSize}
                  onChange={(e) => onStyleChange({ ...style, fontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-red-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Small</span>
                  <span>Huge</span>
                </div>
              </div>

              {/* 3. Background Presets */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Background Style</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handlePresetChange('outline')}
                    className={`py-3 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      style.backgroundColor === 'transparent' && style.hasShadow 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Type size={16} />
                    Outline
                  </button>
                  <button 
                    onClick={() => handlePresetChange('semi')}
                    className={`py-3 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      style.backgroundColor === 'rgba(0,0,0,0.5)' 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Layers size={16} />
                    Semi-Box
                  </button>
                  <button 
                    onClick={() => handlePresetChange('box')}
                    className={`py-3 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      style.backgroundColor === 'black' 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Settings2 size={16} />
                    Solid Box
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className="mt-4 p-6 rounded-lg bg-black border border-gray-700 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40"></div>
                 <div className="relative z-10 transition-all duration-300">
                    <span style={{
                        color: style.color,
                        fontSize: `${Math.min(style.fontSize, 24)}px`, // Clamp size for preview
                        backgroundColor: style.backgroundColor,
                        textShadow: style.hasShadow ? `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000` : 'none',
                        padding: style.backgroundColor !== 'transparent' ? '4px 10px' : '0',
                        borderRadius: '4px'
                    }}>
                        Subtitle Preview
                    </span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;