import React from 'react';
import { LayerType, WeatherAnalysis } from '../types';
import { Wind, CloudRain, Clock, Tornado, Navigation } from 'lucide-react';

interface ForecastBarProps {
  analysis: WeatherAnalysis | null;
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  loading: boolean;
}

const ForecastBar: React.FC<ForecastBarProps> = ({ analysis, activeLayer, onLayerChange, loading }) => {
  if (!analysis && !loading) return null;
  if (loading && !analysis) return null; // Wait for data

  const handleLayerSwitch = (metric: 'WIND' | 'RAIN') => {
    if (metric === 'WIND') onLayerChange(LayerType.WIND);
    if (metric === 'RAIN') onLayerChange(LayerType.RAIN);
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 z-[1000] px-4 flex justify-center pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 max-w-4xl w-full pointer-events-auto flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        
        {/* Storm Warning Section */}
        {analysis?.stormForecast?.hasStorm ? (
          <div className="flex-shrink-0 bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-3 animate-pulse">
            <div className="bg-red-500 p-2 rounded-full text-white">
              <Tornado className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-red-200 text-xs font-bold uppercase tracking-wider">Cảnh báo Bão/ATNĐ</div>
              <div className="text-white font-bold">{analysis.stormForecast.name}</div>
              <div className="text-red-300 text-xs flex items-center gap-1 mt-1">
                <Navigation className="w-3 h-3" /> {analysis.stormForecast.direction} • {analysis.stormForecast.intensity}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3 min-w-[180px]">
             <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
               <Tornado className="w-5 h-5 opacity-50" />
             </div>
             <div>
               <div className="text-emerald-400/70 text-xs font-bold uppercase">Tình trạng Bão</div>
               <div className="text-emerald-200 text-sm font-medium">An toàn</div>
             </div>
          </div>
        )}

        {/* 48H Timeline */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center gap-2 mr-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Dự báo 48H</span>
            </div>
            
            <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block"></div>

            {analysis?.forecast48h?.map((point, idx) => (
              <div key={idx} className="flex flex-col items-center bg-slate-800/50 rounded-lg p-2 min-w-[90px] border border-slate-700 hover:bg-slate-800 transition-colors">
                <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-1.5 rounded mb-1">{point.timeLabel}</span>
                
                <div className="flex items-center gap-2 w-full justify-between px-1">
                  {/* Rain Toggle */}
                  <button 
                    onClick={() => handleLayerSwitch('RAIN')}
                    className={`flex flex-col items-center group ${activeLayer === LayerType.RAIN ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    title="Xem bản đồ Mưa"
                  >
                    <CloudRain className={`w-3 h-3 mb-0.5 ${activeLayer === LayerType.RAIN ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${activeLayer === LayerType.RAIN ? 'text-cyan-400' : 'text-slate-300'}`}>{point.rainfall}</span>
                  </button>

                  <div className="w-px h-6 bg-slate-700 mx-1"></div>

                  {/* Wind Toggle */}
                  <button 
                    onClick={() => handleLayerSwitch('WIND')}
                    className={`flex flex-col items-center group ${activeLayer === LayerType.WIND ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    title="Xem bản đồ Gió"
                  >
                    <Wind className={`w-3 h-3 mb-0.5 ${activeLayer === LayerType.WIND ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${activeLayer === LayerType.WIND ? 'text-blue-400' : 'text-slate-300'}`}>{point.windSpeed}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForecastBar;