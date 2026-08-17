export interface GpxPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  distanceFromStartKm?: number;
  slopePercent?: number;
}

export interface GpxBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface GpxTrack {
  name: string;
  points: GpxPoint[];
  totalDistanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  minElevation: number;
  maxElevation: number;
  bounds: GpxBounds;
}

export interface UserPosition {
  latitude: number;
  longitude: number;
  heading: number; // 0-360 degrees
  speedKmh: number;
  altitude: number;
  accuracy: number;
  timestamp: number;
}

export type CameraMode = 'headingUp' | 'northUp' | 'free';

export interface NavigationTelemetry {
  isOffTrack: boolean;
  distanceToTrackM: number;
  nearestPointIndex: number;
  remainingDistanceKm: number;
  progressPercent: number;
  currentSlopePercent: number;
}
