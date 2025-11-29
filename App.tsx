import React, { useState, useCallback } from 'react';
import MapViewer from './components/MapViewer';
import ControlPanel from './components/ControlPanel';
import { LayerType, WeatherAnalysis } from './types';
import { analyzeLocationConditions, generateLocationImage } from './services/geminiService';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerType>(LayerType.TERRAIN);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<WeatherAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setAnalysis(null);
    setGeneratedImage(null);
    
    // Step 1: Analyze Text
    try {
      const result = await analyzeLocationConditions(lat, lng, activeLayer);
      setAnalysis(result);
      setLoading(false);

      // Step 2: Generate Image (Parallel or Sequential)
      // We start this after text analysis to use the location name and description for a better prompt
      if (result) {
        setImageLoading(true);
        const imageUrl = await generateLocationImage(result.locationName, result.immersiveDescription, activeLayer);
        setGeneratedImage(imageUrl);
        setImageLoading(false);
      }

    } catch (error) {
      console.error("Main Process Error:", error);
      setLoading(false);
      setImageLoading(false);
    }
  }, [activeLayer]);

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapViewer 
          onLocationSelect={handleLocationSelect} 
          activeLayer={activeLayer}
          is3DMode={is3DMode}
        />
      </div>

      {/* Sidebar / Overlay */}
      <ControlPanel 
        activeLayer={activeLayer} 
        onLayerChange={handleLayerChange}
        analysis={analysis}
        loading={loading}
        generatedImage={generatedImage}
        imageLoading={imageLoading}
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
      />
      
      {/* Mobile Toggle or Info could go here */}
      <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/10 hidden md:block">
         {is3DMode ? 'Chế độ Vệ tinh 3D kích hoạt' : 'Chế độ Bản đồ 2D'}
      </div>
    </div>
  );
};

export default App;