import React from 'react';
import { LayerType, WeatherAnalysis } from '../types';
import { Wind, CloudRain, Thermometer, Mountain, MapPin, Activity, Loader2, Sparkles, Box, Layers } from 'lucide-react';

interface ControlPanelProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  analysis: WeatherAnalysis | null;
  loading: boolean;
  generatedImage: string | null;
  imageLoading: boolean;
  is3DMode: boolean;
  onToggle3D: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  activeLayer,
  onLayerChange,
  analysis,
  loading,
  generatedImage,
  imageLoading,
  is3DMode,
  onToggle3D,
}) => {
  const layers = [
    { id: LayerType.TERRAIN, label: 'Địa hình', icon: Mountain, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/50' },
    { id: LayerType.WIND, label: 'Tốc độ gió', icon: Wind, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/50' },
    { id: LayerType.RAIN, label: 'Lượng mưa', icon: CloudRain, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/50' },
    { id: LayerType.TEMPERATURE, label: 'Nhiệt độ', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/50' },
  ];

  return (
    <div className="absolute top-0 left-0 h-full w-full md:w-[450px] bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 z-[1000] flex flex-col shadow-2xl transition-transform duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          VN Geo-Immersive AI
        </h1>
        <p className="text-slate-400 text-sm mt-1">Hệ thống phân tích môi trường thực tế ảo</p>
      </div>

      {/* Layer Selection */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
              activeLayer === layer.id
                ? `${layer.bg} border-l-4`
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <layer.icon className={`w-5 h-5 ${layer.color}`} />
            <span className={`text-sm font-medium ${activeLayer === layer.id ? 'text-white' : 'text-slate-300'}`}>
              {layer.label}
            </span>
          </button>
        ))}
      </div>

      {/* 3D Toggle */}
      <div className="px-4 pb-2">
         <button 
            onClick={onToggle3D}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 group ${
                is3DMode 
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
         >
            {is3DMode ? <Box className="w-5 h-5 animate-pulse" /> : <Layers className="w-5 h-5" />}
            <span className="font-semibold">{is3DMode ? 'Chế độ 3D Vệ tinh Đang Bật' : 'Bật Chế độ 3D Vệ tinh'}</span>
         </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 glass-panel">
        {!analysis && !loading && (
          <div className="text-center py-20 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50 animate-bounce" />
            <p>Chọn một địa điểm trên bản đồ Việt Nam<br/>để bắt đầu phân tích AI.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-blue-400 space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin" />
            <p className="animate-pulse">Gemini đang phân tích vệ tinh...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Location Header */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                {analysis.locationName}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{analysis.summary}</p>
            </div>

            {/* Immersive AI Visual */}
            <div className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black/40">
              {imageLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-purple-400">
                   <Sparkles className="w-8 h-8 animate-pulse" />
                   <span className="text-xs uppercase tracking-widest">Đang tạo hình ảnh VR...</span>
                 </div>
              ) : generatedImage ? (
                <>
                   <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-xs text-slate-300 text-center">
                     Hình ảnh được tạo bởi Gemini AI
                   </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">Không thể tạo hình ảnh</div>
              )}
            </div>

            {/* AI VR Description */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-5 rounded-xl border border-indigo-500/30 relative">
              <div className="absolute top-2 right-2">
                 <Sparkles className="w-4 h-4 text-purple-400 opacity-70" />
              </div>
              <h3 className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">Trải nghiệm Thực tế ảo</h3>
              <p className="text-slate-200 leading-relaxed italic text-sm">
                "{analysis.immersiveDescription}"
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Nhiệt độ</div>
                <div className="text-lg font-semibold text-orange-400">{analysis.temperature}</div>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Gió</div>
                <div className="text-lg font-semibold text-blue-400">{analysis.windSpeed}</div>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Lượng mưa</div>
                <div className="text-lg font-semibold text-cyan-400">{analysis.rainfall}</div>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Địa hình</div>
                <div className="text-lg font-semibold text-emerald-400 truncate" title={analysis.terrainType}>{analysis.terrainType}</div>
              </div>
            </div>

             <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1 uppercase">Lời khuyên AI</div>
                <div className="text-sm text-slate-200">{analysis.recommendation}</div>
              </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;