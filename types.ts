export enum LayerType {
  TERRAIN = 'TERRAIN',
  WIND = 'WIND',
  RAIN = 'RAIN',
  TEMPERATURE = 'TEMPERATURE',
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface ForecastPoint {
  timeLabel: string; // e.g. "+12h", "Ngày mai"
  temperature: string;
  windSpeed: string;
  rainfall: string;
}

export interface FloodWarning {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affectedArea: string;
}

export interface StormPathPoint {
  lat: number;
  lng: number;
  time: string; // e.g. "+12h"
  intensity: string; // e.g. "Cấp 10"
}

export interface StormForecast {
  hasStorm: boolean;
  name: string; // Tên bão hoặc "Áp thấp nhiệt đới"
  intensity: string; // Cấp độ gió
  direction: string; // Hướng di chuyển
  eta: string; // Thời gian dự kiến ảnh hưởng
  predictedPath?: StormPathPoint[]; // Toạ độ dự báo đường đi của bão
}

export interface WeatherAnalysis {
  locationName: string;
  summary: string;
  immersiveDescription: string;
  temperature: string;
  minTemp?: string; // New: Min temp for the day
  maxTemp?: string; // New: Max temp for the day
  windSpeed: string;
  windDirection?: string; // New: Short direction (e.g., 'NE', 'Đ')
  rainfall: string;
  terrainType: string;
  recommendation: string;
  // New fields
  forecast48h: ForecastPoint[];
  floodWarning: FloodWarning;
  stormForecast: StormForecast;
}

export interface GeneratedVisual {
  imageUrl: string | null;
  loading: boolean;
}