export type MotionState = 'stationary' | 'walking' | 'driving';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OrbitMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  isSelf?: boolean;
  coords: Coordinates;
  speedKmh: number;
  motionState: MotionState;
  batteryPct: number;
  isCharging?: boolean;
  currentZoneName: string | null;
  lastUpdatedAt: number;
  sosActive?: boolean;
  ghostMode?: boolean;
}

export interface OrbitCircle {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
  accentColor: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  icon: 'home' | 'briefcase' | 'school' | 'fitness' | 'pin';
  coords: Coordinates;
  radiusMeters: number;
  notifyOnArrive: boolean;
  notifyOnLeave: boolean;
  color: string;
}

export interface DriveTrip {
  id: string;
  memberName: string;
  originLabel: string;
  destinationLabel: string;
  distanceKm: number;
  durationMin: number;
  maxSpeedKmh: number;
  safetyScore: number;
  eventsCount: number;
  timestamp: number;
}

export type FeedEventType = 'checkin' | 'zone_arrive' | 'zone_leave' | 'sos' | 'ping';

export interface OrbitFeedEvent {
  id: string;
  type: FeedEventType;
  memberName: string;
  message: string;
  locationLabel?: string;
  timestamp: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  avatarColor: string;
  speedUnit: 'kmh' | 'mph';
  onboarded: boolean;
}

