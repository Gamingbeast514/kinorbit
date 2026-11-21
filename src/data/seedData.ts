import {
  Coordinates,
  DriveTrip,
  EmergencyContact,
  GeofenceZone,
  OrbitCircle,
  OrbitFeedEvent,
  OrbitMember,
} from '../types/orbit';

// Default anchor (anchored to user's real GPS once permission is granted)
export const DEFAULT_CENTER: Coordinates = {
  latitude: 33.6844,
  longitude: 73.0479,
};

export function createSeedMembers(center: Coordinates): OrbitMember[] {
  const now = Date.now();
  return [
    {
      id: 'self',
      name: 'You',
      initials: 'YO',
      role: 'Host',
      avatarColor: '#00D2B4',
      isSelf: true,
      coords: { ...center },
      speedKmh: 0,
      motionState: 'stationary',
      batteryPct: 88,
      isCharging: false,
      currentZoneName: 'Basecamp',
      lastUpdatedAt: now,
      sosActive: false,
      ghostMode: false,
    },
    {
      id: 'm-ayesha',
      name: 'Ayesha',
      initials: 'AY',
      role: 'Family',
      avatarColor: '#38BDF8',
      coords: {
        latitude: center.latitude + 0.0085,
        longitude: center.longitude + 0.0062,
      },
      speedKmh: 42,
      motionState: 'driving',
      batteryPct: 74,
      isCharging: true,
      currentZoneName: null,
      lastUpdatedAt: now - 12000,
    },
    {
      id: 'm-zain',
      name: 'Zain',
      initials: 'ZN',
      role: 'Family',
      avatarColor: '#FFB020',
      coords: {
        latitude: center.latitude - 0.0042,
        longitude: center.longitude + 0.0091,
      },
      speedKmh: 4,
      motionState: 'walking',
      batteryPct: 51,
      currentZoneName: 'Campus',
      lastUpdatedAt: now - 45000,
    },
    {
      id: 'm-sara',
      name: 'Sara',
      initials: 'SR',
      role: 'Close Friend',
      avatarColor: '#A78BFA',
      coords: {
        latitude: center.latitude + 0.0021,
        longitude: center.longitude - 0.0074,
      },
      speedKmh: 0,
      motionState: 'stationary',
      batteryPct: 19,
      currentZoneName: 'Studio',
      lastUpdatedAt: now - 120000,
    },
  ];
}

export function createSeedZones(center: Coordinates): GeofenceZone[] {
  return [
    {
      id: 'z-basecamp',
      name: 'Basecamp',
      icon: 'home',
      coords: { ...center },
      radiusMeters: 250,
      notifyOnArrive: true,
      notifyOnLeave: true,
      color: '#00D2B4',
    },
    {
      id: 'z-studio',
      name: 'Studio',
      icon: 'briefcase',
      coords: {
        latitude: center.latitude + 0.0021,
        longitude: center.longitude - 0.0074,
      },
      radiusMeters: 200,
      notifyOnArrive: true,
      notifyOnLeave: false,
      color: '#A78BFA',
    },
    {
      id: 'z-campus',
      name: 'Campus',
      icon: 'school',
      coords: {
        latitude: center.latitude - 0.0042,
        longitude: center.longitude + 0.0091,
      },
      radiusMeters: 350,
      notifyOnArrive: true,
      notifyOnLeave: true,
      color: '#FFB020',
    },
  ];
}

export const SEED_CIRCLES: OrbitCircle[] = [
  {
    id: 'c-home',
    name: 'Home Orbit',
    inviteCode: 'KO84M2',
    memberIds: ['self', 'm-ayesha', 'm-zain', 'm-sara'],
    accentColor: '#00D2B4',
  },
  {
    id: 'c-crew',
    name: 'Roadtrip Crew',
    inviteCode: 'RT93X7',
    memberIds: ['self', 'm-sara'],
    accentColor: '#38BDF8',
  },
];

export const SEED_TRIPS: DriveTrip[] = [
  {
    id: 't-1',
    memberName: 'Ayesha',
    originLabel: 'Basecamp',
    destinationLabel: 'Downtown Hub',
    distanceKm: 11.4,
    durationMin: 22,
    maxSpeedKmh: 64,
    safetyScore: 96,
    eventsCount: 0,
    timestamp: Date.now() - 1000 * 60 * 50,
  },
  {
    id: 't-2',
    memberName: 'You',
    originLabel: 'Studio',
    destinationLabel: 'Basecamp',
    distanceKm: 7.8,
    durationMin: 16,
    maxSpeedKmh: 58,
    safetyScore: 92,
    eventsCount: 1,
    timestamp: Date.now() - 1000 * 60 * 240,
  },
];

export const SEED_FEED: OrbitFeedEvent[] = [
  {
    id: 'f-1',
    type: 'zone_arrive',
    memberName: 'Zain',
    message: 'Arrived at Campus',
    locationLabel: 'Campus Zone',
    timestamp: Date.now() - 1000 * 60 * 12,
  },
  {
    id: 'f-2',
    type: 'checkin',
    memberName: 'Sara',
    message: 'Checked in — wrapping up design sprint!',
    locationLabel: 'Studio',
    timestamp: Date.now() - 1000 * 60 * 38,
  },
  {
    id: 'f-3',
    type: 'zone_leave',
    memberName: 'Ayesha',
    message: 'Departed Basecamp',
    locationLabel: 'Basecamp Zone',
    timestamp: Date.now() - 1000 * 60 * 52,
  },
];

export const SEED_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'Ayesha Tariq',
    relation: 'Primary Contact',
    phone: '+92 300 5550142',
  },
  {
    id: 'ec-2',
    name: 'Zain Khan',
    relation: 'Backup Contact',
    phone: '+92 321 5550199',
  },
];
