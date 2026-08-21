export interface Waypoint {
  id: string;
  name: string;
  desc?: string;
  icon: string;
  lat: number;
  lng: number;
  ele?: number;
}

export interface TurnInstruction {
  index: number;
  lat: number;
  lng: number;
  distKm: number;
  angle: number;
  direction: 'left' | 'right' | 'slight_left' | 'slight_right' | 'sharp_left' | 'sharp_right' | 'uturn' | 'straight';
  text: string;
  icon: string;
  poiName?: string;
}

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
  id?: string;
  name: string;
  points: GpxPoint[];
  waypoints?: Waypoint[];
  turns?: TurnInstruction[];
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
  nextTurn?: TurnInstruction;
}

