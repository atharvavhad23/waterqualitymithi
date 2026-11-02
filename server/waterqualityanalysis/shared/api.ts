export interface WaterQualityData {
  id: number;
  location: string;
  parameter: string;
  value: number;
  timestamp: Date;
}

export interface WaterQualityResponse {
  data: WaterQualityData[];
  message: string;
}

export interface CreateWaterQualityEntry {
  location: string;
  parameter: string;
  value: number;
}

export interface CreateWaterQualityResponse {
  message: string;
  entry: WaterQualityData;
}