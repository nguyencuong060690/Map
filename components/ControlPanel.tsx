import React, { useState } from 'react';
import { LayerType, WeatherAnalysis } from '../types';
import { Layers, Navigation, Menu, Play, Pause, Sun, Cloud, CloudLightning, CloudFog, CloudRain } from 'lucide-react';

interface ControlPanelProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  analysis: WeatherAnalysis | null;
  loading: boolean;
  generatedImage: string | null;
  imageLoading: boolean;
  is3DMode: boolean;
  onToggle3D: () => void;
  onRefresh: () => void;
  onLocateMe: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  activeLayer,
  onLayerChange,
  analysis,
  is3DMode,
  onToggle3D,
  onLocateMe,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Exact CSS Gradients based on the images provided
  const getLegendStyle = () => {
    switch(activeLayer) {
      case LayerType.RAIN: 
        // Blue -> Purple -> Yellow (Rainfall)
        return { background: 'linear-gradient(to top, #2563eb 0%, #a855f7 50%, #facc15 100%)' };
      case LayerType.TEMPERATURE: 
        // Purple -> Blue -> Cyan -> Green -> Yellow -> Red (Rainbow Temperature)
        return { background: 'linear-gradient(to top, #4c1d95 0%, #2563eb 20%, #22d3ee 40%, #4ade80 60%, #facc15 80%, #dc2626 100%)' };
      case LayerType.WIND: 
        // Light Blue -> Dark Blue (Wind)
        return { background: 'linear-gradient(to top, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)' };
      default: 
        return { background: 'linear-gradient(to top, #cbd5e1 0%, #64748b 100%)' };
    }
  };

  const getLegendLabels = () => {
    switch(activeLayer) {
      case LayerType.TEMPERATURE: return ['55', '30', '20', '10', '0', '-20', '-40'];
      case LayerType.WIND: return ['120', '80', '40', '0'];
      default: return ['Rất lớn', 'Lớn', 'Vừa', 'Nhỏ']; // Rain
    }
  };

  const labels = getLegendLabels();

  // Determine Icon based on summary
  const getWeatherIcon = () => {
    const summary = analysis?.summary?.toLowerCase() || '';
    if (summary.includes('mưa')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (summary.includes('bão') || summary.includes('sấm')) return <CloudLightning className="w-5 h-5 text-purple-400" />;
    if (summary.includes('mây') || summary.includes('âm u')) return <Cloud className="w-5 h-5 text-gray-400" />;
    return <Sun className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <>
      {/* Top Left: Done Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl px-5 py-2.5 text-slate-900 font-bold text-sm hover:bg-white transition-colors">
          Xong
        </button>
      </div>

      {/* Top Right: Actions */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
        <button 
          onClick={onLocateMe}
          className="bg-white/90 backdrop-blur-md shadow-lg p-3 rounded-xl text-slate-700 hover:text-blue-500 transition-colors"
        >
          <Navigation className="w-6 h-6 fill-current" />
        </button>
        
        <button className="bg-white/90 backdrop-blur-md shadow-lg p-3 rounded-xl text-slate-700 hover:text-slate-900 transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`bg-white/90 backdrop-blur-md shadow-lg p-3 rounded-xl transition-colors ${showLayerMenu ? 'text-blue-500' : 'text-slate-700'}`}
          >
            <Layers className="w-6 h-6" />
          </button>
          
          {/* Layer Popup Menu */}
          {showLayerMenu && (
             <div className="absolute right-0 top-14 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-2 w-48 animate-in fade-in zoom-in-95 duration-200 border border-slate-100/50">
                <div className="space-y-1">
                   {[
                     { type: LayerType.RAIN, label: 'Lượng mưa' },
                     { type: LayerType.TEMPERATURE, label: 'Nhiệt độ' },
                     { type: LayerType.WIND, label: 'Tốc độ gió' },
                   ].map((l) => (
                     <button
                        key={l.type}
                        onClick={() => { onLayerChange(l.type); setShowLayerMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeLayer === l.type ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                       {l.label}
                     </button>
                   ))}
                   <div className="h-px bg-slate-100 my-1"></div>
                   <button
                        onClick={onToggle3D}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${is3DMode ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                       {is3DMode ? 'Tắt chế độ 3D' : 'Bật bản đồ Vệ tinh'}
                     </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Floating Left: Legend */}
      <div className="absolute top-24 left-4 z-[1000]">
        <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-xl p-3 w-32 border border-white/20">
          <div className="text-xs font-bold text-slate-800 mb-2">
            {activeLayer === LayerType.RAIN ? 'Lượng mưa' : 
             activeLayer === LayerType.TEMPERATURE ? 'Nhiệt độ' : 
             activeLayer === LayerType.WIND ? 'Gió (km/h)' : 'Chú thích'}
          </div>
          <div className="flex gap-3 h-40">
             {/* Gradient Bar */}
             <div 
               className="w-1.5 rounded-full shadow-inner opacity-90" 
               style={getLegendStyle()}
             ></div>
             {/* Labels */}
             <div className="flex flex-col justify-between py-0.5 text-[11px] font-medium text-slate-500">
               {labels.map((label, idx) => (
                 <span key={idx}>{label}</span>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Bottom: Playback & Timeline */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex justify-center">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[2rem] p-4 w-full max-w-2xl flex flex-col gap-3 border border-white/20">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-slate-200/50 hover:bg-slate-300/50 flex items-center justify-center transition-colors text-slate-800 backdrop-blur-sm"
              >
                 {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <div className="flex-1">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    {getWeatherIcon()}
                    <span>
                        {activeLayer === LayerType.WIND ? 'Tốc độ gió' : 
                         activeLayer === LayerType.TEMPERATURE ? 'Dự báo nhiệt độ' : 'Dự báo lượng mưa'}
                    </span>
                    <span className="text-slate-400 font-normal">| {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                 </div>
              </div>
           </div>

           {/* Timeline Slider Mockup */}
           <div className="relative h-8 w-full mt-1">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200/80 rounded-full overflow-hidden">
                 <div className="h-full w-1/4 bg-slate-800 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-3 uppercase tracking-wide">
                 <span>Bây giờ</span>
                 <span>12 giờ</span>
                 <span>14 giờ</span>
                 <span>16 giờ</span>
                 <span>18 giờ</span>
                 <span>20 giờ</span>
              </div>
              {/* Draggable Knob */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-1.5 h-3 bg-slate-800 rounded-full shadow-md cursor-pointer hover:scale-125 transition-transform"></div>
           </div>
           
           {/* Analysis Text Summary */}
           {analysis && (
             <div className="mt-1 pt-2 border-t border-slate-200/50 text-xs text-slate-600 flex justify-between items-center">
                <span className="font-bold">{analysis.locationName}</span>
                <span className="truncate max-w-[200px] text-right">{analysis.immersiveDescription}</span>
             </div>
           )}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
