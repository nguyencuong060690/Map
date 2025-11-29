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

export interface WeatherAnalysis {
  locationName: string;
  summary: string;
  immersiveDescription: string;
  temperature: string;
  windSpeed: string;
  rainfall: string;
  terrainType: string;
  recommendation: string;
}

export interface GeneratedVisual {
  imageUrl: string | null;
  loading: boolean;
}
