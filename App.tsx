import React, { useState, useCallback, useEffect } from 'react';
import MapViewer from './components/MapViewer';
import ControlPanel from './components/ControlPanel';
import { LayerType, WeatherAnalysis } from './types';
import { analyzeLocationConditions, generateLocationImage } from './services/geminiService';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerType>(LayerType.RAIN); // Default to Rain as per image
  const [is3DMode, setIs3DMode] = useState<boolean>(false); // Default to 2D Light mode as per image
  const [analysis, setAnalysis] = useState<WeatherAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setLoading(true);
    setAnalysis(null);
    setGeneratedImage(null);
    
    // Step 1: Analyze Text
    try {
      const result = await analyzeLocationConditions(lat, lng, activeLayer);
      setAnalysis(result);
      setLoading(false);

      // Step 2: Generate Image (Parallel or Sequential)
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

  // Auto-locate user on mount
  useEffect(() => {
    const defaultLocation = { lat: 16.0471, lng: 108.2068 }; // Center of Vietnam

    const handleGeoSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      handleLocationSelect(latitude, longitude);
    };

    const handleGeoError = (error: GeolocationPositionError) => {
      let errorMessage = "Unknown error";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
        default:
          errorMessage = error.message;
      }
      console.warn(`Geolocation unavailable: ${errorMessage}`);
      // Fallback to center of VN if failed
      handleLocationSelect(defaultLocation.lat, defaultLocation.lng);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleGeoSuccess,
        handleGeoError,
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      handleLocationSelect(defaultLocation.lat, defaultLocation.lng);
    }
  }, []); // Run once on mount. Intentionally omit handleLocationSelect to avoid re-run.

  const handleRefresh = useCallback(() => {
    if (selectedCoords) {
      handleLocationSelect(selectedCoords.lat, selectedCoords.lng);
    }
  }, [selectedCoords, handleLocationSelect]);

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
  };

  const handleLocateMe = () => {
    if (userLocation) {
      handleLocationSelect(userLocation.lat, userLocation.lng);
    } else if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            handleLocationSelect(latitude, longitude);
         },
         (error) => {
            console.warn("Locate me failed:", error.message);
            alert("Không thể định vị vị trí của bạn.");
         }
       );
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapViewer 
          onLocationSelect={handleLocationSelect} 
          activeLayer={activeLayer}
          is3DMode={is3DMode}
          stormForecast={analysis?.stormForecast}
          selectedLocation={selectedCoords}
          userLocation={userLocation}
          weatherData={analysis} // Pass analysis to show temp on marker
        />
      </div>

      {/* Apple-style Floating Control Panel */}
      <ControlPanel 
        activeLayer={activeLayer} 
        onLayerChange={handleLayerChange}
        analysis={analysis}
        loading={loading}
        generatedImage={generatedImage}
        imageLoading={imageLoading}
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        onRefresh={handleRefresh}
        onLocateMe={handleLocateMe}
      />
    </div>
  );
};

export default App;