
import React from 'react';
import { X, Type, Check, Settings2, Palette } from 'lucide-react';
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
  onClose, 
  style, 
  onStyleChange,
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

  return (
    <div className="w-full mt-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
            <Settings2 size={20} className="text-primary" />
            <span className="text-lg uppercase tracking-widest font-black">Appearance</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-primary transition-colors bg-black/5 dark:bg-white/5 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Color Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2 tracking-widest">
              <Palette size={14} /> Color Palette
            </label>
            <div className="grid grid-cols-6 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onStyleChange({ ...style, color })}
                  className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                    style.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent shadow-sm'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {style.color === color && <Check size={14} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Section */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <span>Font Size</span>
              <span className="text-primary">{style.fontSize}px</span>
            </div>
            <input 
              type="range" min="12" max="40" step="2"
              value={style.fontSize}
              onChange={(e) => onStyleChange({ ...style, fontSize: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Background Presets */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2 tracking-widest">
              <Type size={14} /> Style Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handlePresetChange('outline')}
                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  style.backgroundColor === 'transparent' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 border-transparent text-gray-500'
                }`}
              >Outline</button>
              <button 
                onClick={() => handlePresetChange('semi')}
                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  style.backgroundColor === 'rgba(0,0,0,0.5)' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 border-transparent text-gray-500'
                }`}
              >Semi-Box</button>
              <button 
                onClick={() => handlePresetChange('box')}
                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  style.backgroundColor === 'black' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 border-transparent text-gray-500'
                }`}
              >Solid Box</button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SettingsPanel;
