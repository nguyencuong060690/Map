import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { LayerType } from '../types';

// Fix Leaflet icon issue in React by using CDN URLs directly
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
}

const LocationMarker: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Đang phân tích vị trí này...</Popup>
    </Marker>
  );
};

// Component to render specific visual effects based on layer
const LayerEffects: React.FC<{ activeLayer: LayerType; position: L.LatLng | null; is3DMode: boolean }> = ({ activeLayer, position, is3DMode }) => {
  if (!position) return null;

  // Simple visualization to indicate the area of effect
  let color = 'white';
  let radius = 5000;
  let opacity = is3DMode ? 0.4 : 0.2; // Increase opacity in 3D mode for visibility against satellite

  switch (activeLayer) {
    case LayerType.TEMPERATURE:
      color = '#f97316'; // Orange
      break;
    case LayerType.RAIN:
      color = '#06b6d4'; // Cyan
      break;
    case LayerType.WIND:
      color = '#3b82f6'; // Blue
      break;
    case LayerType.TERRAIN:
      color = '#10b981'; // Emerald
      break;
  }

  return (
    <Circle 
      center={position} 
      radius={radius} 
      pathOptions={{ color: color, fillColor: color, fillOpacity: opacity }} 
    />
  );
};

const MapViewer: React.FC<MapViewerProps> = ({ onLocationSelect, activeLayer, is3DMode }) => {
  const [selectedPos, setSelectedPos] = useState<L.LatLng | null>(null);

  const handleSelect = (lat: number, lng: number) => {
    setSelectedPos(new L.LatLng(lat, lng));
    onLocationSelect(lat, lng);
  };

  // Determine Tile Layer based on active mode
  let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  if (is3DMode) {
      // Esri World Imagery for 3D/Satellite look
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
  } else if (activeLayer === LayerType.TERRAIN) {
     tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
     attribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
  }

  // CSS Transform for pseudo-3D effect
  const containerStyle: React.CSSProperties = {
      height: '100%',
      width: '100%',
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: is3DMode 
        ? 'perspective(1000px) rotateX(45deg) scale(1.4) translateY(-100px)' 
        : 'perspective(0px) rotateX(0deg) scale(1) translateY(0px)',
      transformOrigin: 'center 60%',
  };

  return (
    <div className="h-full w-full z-0 bg-gray-900 overflow-hidden relative perspective-container">
      <style>{`
        .leaflet-container {
            background: #000 !important;
        }
      `}</style>
      <div style={containerStyle}>
          <MapContainer
            center={[14.0583, 108.2772]} // Center of Vietnam
            zoom={6}
            scrollWheelZoom={true}
            className="h-full w-full outline-none"
            zoomControl={false} // Move zoom control to avoid conflict with sidebar
          >
            <TileLayer
              attribution={attribution}
              url={tileUrl}
            />
            <LocationMarker onSelect={handleSelect} />
            <LayerEffects activeLayer={activeLayer} position={selectedPos} is3DMode={is3DMode} />
          </MapContainer>
      </div>
      
      {/* 3D Mode Overlay Vignette for atmosphere */}
      {is3DMode && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/40 z-[400]" />
      )}
    </div>
  );
};

export default MapViewer;