import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { LayerType, StormForecast, WeatherAnalysis } from '../types';

// Standard Leaflet Icon Fix
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  activeLayer: LayerType;
  is3DMode: boolean;
  stormForecast?: StormForecast;
  selectedLocation: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  weatherData: WeatherAnalysis | null;
}

const LocationHandler: React.FC<{ 
  onSelect: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  selectedLocation: { lat: number; lng: number } | null;
}> = ({ onSelect, userLocation, selectedLocation }) => {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (userLocation && !selectedLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 10, { animate: true, duration: 1.5 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (selectedLocation) {
       map.flyTo([selectedLocation.lat, selectedLocation.lng], 10, { animate: true, duration: 1.5 });
    }
  }, [selectedLocation, map]);

  return null;
};

// --- MARKER CREATION FUNCTIONS ---

// 1. Temperature Marker (Apple Style: Circle Pill with Min/Max)
const createTempMarker = (temp: string = '--', min: string = '--', max: string = '--') => {
  const t = temp.replace('°', '').replace('C', '');
  return L.divIcon({
    className: 'temp-marker',
    html: `
      <div class="flex flex-col items-center justify-center">
        <div class="w-14 h-14 bg-white/95 backdrop-blur rounded-full shadow-xl border-4 border-yellow-400 flex flex-col items-center justify-center text-slate-900">
           <span class="text-xl font-bold leading-none mt-1">${t}°</span>
        </div>
        <div class="mt-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-semibold shadow-sm">
           H:${max} L:${min}
        </div>
      </div>
    `,
    iconSize: [56, 70],
    iconAnchor: [28, 35],
  });
};

// 2. Wind Marker (Windy Style: Direction on top, Speed in middle, Unit bottom)
const createWindMarker = (speed: string = '0', direction: string = 'N') => {
  const s = speed.replace(/\D/g, ''); // Extract number
  return L.divIcon({
    className: 'wind-marker',
    html: `
      <div class="flex flex-col items-center justify-center">
         <div class="w-14 h-14 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center text-slate-800 border-2 border-blue-500/20">
            <span class="text-[9px] font-bold text-slate-400 uppercase leading-tight">${direction}</span>
            <span class="text-lg font-black text-blue-600 leading-none">${s}</span>
            <span class="text-[7px] font-bold text-slate-400 uppercase leading-tight">KM/H</span>
         </div>
         <div class="w-2 h-2 bg-white rounded-full mt-1 shadow-md"></div>
      </div>
    `,
    iconSize: [56, 70],
    iconAnchor: [28, 35],
  });
};

// 3. Rain Marker (Simple Location Pill)
const createRainMarker = (rainfall: string = '0mm') => {
  return L.divIcon({
    className: 'rain-marker',
    html: `
      <div class="flex flex-col items-center">
        <div class="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 14.899a7 7 0 1 1 15.718 2.908c2.496-1.56 3.935-4.254 3.192-7.355-.66-2.754-3.48-4.59-6.283-3.837a7.003 7.003 0 0 0-11.41-3.606A7.003 7.003 0 0 0 0 10.5a7.002 7.002 0 0 0 4 4.399z"/></svg>
           <span class="text-sm font-bold">${rainfall}</span>
        </div>
        <div class="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 shadow-sm"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 35],
  });
};


const MapViewer: React.FC<MapViewerProps> = ({ 
  onLocationSelect, 
  activeLayer, 
  is3DMode, 
  stormForecast,
  selectedLocation,
  userLocation,
  weatherData 
}) => {
  
  // Track the last alert sent to prevent duplicate alerts for the same event
  const alertShownRef = useRef<string | null>(null);

  // Storm Proximity Alert Logic
  useEffect(() => {
    if (userLocation && stormForecast && stormForecast.hasStorm && stormForecast.predictedPath) {
      // Threshold distance in degrees (approx 2 degrees ~= 220km)
      const PROXIMITY_THRESHOLD = 2.0;
      
      const approachingPoint = stormForecast.predictedPath.find(point => {
        const distance = Math.sqrt(
          Math.pow(point.lat - userLocation.lat, 2) + 
          Math.pow(point.lng - userLocation.lng, 2)
        );
        return distance < PROXIMITY_THRESHOLD;
      });

      if (approachingPoint) {
        // Create a unique key for this specific alert scenario
        const alertKey = `${stormForecast.name}-${userLocation.lat.toFixed(2)}-${userLocation.lng.toFixed(2)}`;
        
        if (alertShownRef.current !== alertKey) {
          // Trigger Push Notification (Simulated)
          window.alert(
            `⚠️ CẢNH BÁO KHẨN CẤP:\n\n` +
            `Bão ${stormForecast.name} (Cấp ${stormForecast.intensity}) đang di chuyển vào khu vực của bạn!\n` +
            `Thời gian dự kiến: ${approachingPoint.time}\n\n` +
            `Vui lòng theo dõi sát diễn biến thời tiết.`
          );
          alertShownRef.current = alertKey;
        }
      }
    }
  }, [userLocation, stormForecast]);

  // -- TILE LAYER LOGIC --
  let tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // Default Light
  let attribution = '&copy; OpenStreetMap &copy; CARTO';
  let mapClassName = 'h-full w-full outline-none ';

  if (is3DMode) {
     tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
     attribution = 'Esri';
  } else if (activeLayer === LayerType.WIND) {
     // **WIND MODE**: Use Dark Matter and Blue Filter to mimic "Blue Map"
     tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; 
     mapClassName += 'wind-map-mode'; // Triggers CSS filter
  } else if (activeLayer === LayerType.TEMPERATURE) {
     // **TEMP MODE**: Use Light Map, but maybe we can add a subtle overlay later
     tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  }

  // -- MARKER LOGIC --
  let markerIcon;
  if (selectedLocation && weatherData) {
     if (activeLayer === LayerType.WIND) {
        markerIcon = createWindMarker(weatherData.windSpeed, weatherData.windDirection);
     } else if (activeLayer === LayerType.TEMPERATURE) {
        markerIcon = createTempMarker(weatherData.temperature, weatherData.minTemp, weatherData.maxTemp);
     } else {
        markerIcon = createRainMarker(weatherData.rainfall);
     }
  } else if (selectedLocation) {
     // Default loading marker
     markerIcon = createRainMarker('...');
  }

  return (
    <div className="h-full w-full z-0 bg-gray-900 relative">
      <style>{`
        /* Global Leaflet Overrides */
        .leaflet-container {
            background: #1e293b; /* Dark Slate background */
            font-family: 'Inter', sans-serif;
        }
        
        /* WIND MAP: Blue Filter Effect */
        .wind-map-mode .leaflet-tile-pane {
            filter: brightness(0.8) sepia(1) hue-rotate(180deg) saturate(3) contrast(1.2);
        }
        
        /* User Location Dot Pulse */
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        .user-dot-pulse {
           position: absolute;
           top: 0; left: 0;
           width: 100%; height: 100%;
           border-radius: 50%;
           background-color: #3b82f6;
           animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}</style>

      <MapContainer
        center={[16.0471, 108.2068]}
        zoom={6}
        scrollWheelZoom={true}
        className={mapClassName}
        zoomControl={false}
      >
        <TileLayer
          key={activeLayer + is3DMode} // Force re-render on mode change
          attribution={attribution}
          url={tileUrl}
        />
        
        {/* Borders Overlay for 3D/Dark modes to make boundaries clearer */}
        {(is3DMode || activeLayer === LayerType.WIND) && (
           <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.7}
           />
        )}

        <LocationHandler 
          onSelect={onLocationSelect} 
          userLocation={userLocation}
          selectedLocation={selectedLocation}
        />

        {/* User Location */}
        {userLocation && (
           <Marker 
             position={[userLocation.lat, userLocation.lng]} 
             icon={L.divIcon({
                className: 'user-loc',
                html: '<div class="relative w-4 h-4"><div class="user-dot-pulse"></div><div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div></div>',
                iconSize: [16, 16]
             })} 
             zIndexOffset={100}
           />
        )}

        {/* Selected Location Data Marker */}
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={markerIcon || DefaultIcon}
            zIndexOffset={1000}
          />
        )}

        {/* Heatmap Simulation Overlay for Temperature */}
        {activeLayer === LayerType.TEMPERATURE && selectedLocation && (
           <Circle 
             center={[selectedLocation.lat, selectedLocation.lng]}
             radius={50000}
             pathOptions={{ 
                color: 'transparent', 
                fillColor: '#f59e0b', // Amber/Orange glow
                fillOpacity: 0.3 
             }}
           />
        )}

        {/* Rain Simulation Overlay */}
        {activeLayer === LayerType.RAIN && selectedLocation && (
           <Circle 
             center={[selectedLocation.lat, selectedLocation.lng]}
             radius={30000}
             pathOptions={{ 
                color: 'transparent', 
                fillColor: '#3b82f6', 
                fillOpacity: 0.25
             }}
           />
        )}

        {/* Storm Track */}
        {stormForecast && stormForecast.hasStorm && stormForecast.predictedPath && (
           <Polyline 
             positions={stormForecast.predictedPath.map(p => [p.lat, p.lng])} 
             pathOptions={{ color: 'red', dashArray: '5, 10', weight: 3, opacity: 0.8 }} 
           />
        )}
      </MapContainer>
    </div>
  );
};

export default MapViewer;