import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Battery from 'expo-battery';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSeedMembers,
  createSeedZones,
  DEFAULT_CENTER,
  SEED_CIRCLES,
  SEED_CONTACTS,
  SEED_FEED,
  SEED_TRIPS,
} from '../data/seedData';
import { DARK_THEME, LIGHT_THEME, ThemeColors } from '../theme/tokens';
import {
  Coordinates,
  DriveTrip,
  EmergencyContact,
  GeofenceZone,
  OrbitCircle,
  OrbitFeedEvent,
  OrbitMember,
  UserProfile,
} from '../types/orbit';
import { findContainingZone, generateInviteCode, inferMotionState } from '../utils/geo';

const STORAGE_KEY = '@kinorbit_state_v2';

const DEFAULT_PROFILE: UserProfile = {
  name: 'You',
  initials: 'YO',
  avatarColor: '#27D38B',
  speedUnit: 'kmh',
  themeMode: 'dark',
  onboarded: false,
};

interface PersistedState {
  circles: OrbitCircle[];
  activeCircleId: string;
  zones: GeofenceZone[];
  trips: DriveTrip[];
  feed: OrbitFeedEvent[];
  contacts: EmergencyContact[];
  ghostMode: boolean;
  profile: UserProfile;
}

interface OrbitContextValue {
  profile: UserProfile;
  colors: ThemeColors;
  toggleThemeMode: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  circles: OrbitCircle[];
  activeCircle: OrbitCircle;
  activeMembers: OrbitMember[];
  allMembers: OrbitMember[];
  selfMember: OrbitMember;
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  zones: GeofenceZone[];
  trips: DriveTrip[];
  feed: OrbitFeedEvent[];
  contacts: EmergencyContact[];
  ghostMode: boolean;
  sosActive: boolean;
  simulatingDrive: boolean;
  liveBanner: string | null;
  dismissBanner: () => void;
  locationPermission: 'pending' | 'granted' | 'denied';
  switchCircle: (circleId: string) => void;
  createCircle: (name: string) => void;
  joinCircleByCode: (code: string) => boolean;
  toggleGhostMode: () => void;
  triggerSos: () => void;
  resolveSos: () => void;
  sendCheckIn: (note?: string) => void;
  pingMember: (memberId: string) => void;
  startTestDrive: () => void;
  addZone: (zone: Omit<GeofenceZone, 'id'>) => void;
  updateZoneRadius: (zoneId: string, radiusMeters: number) => void;
  toggleZoneAlert: (zoneId: string, kind: 'arrive' | 'leave') => void;
  removeZone: (zoneId: string) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (contactId: string) => void;
  resetDemoData: () => void;
}

const OrbitContext = createContext<OrbitContextValue | null>(null);

export function OrbitProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [circles, setCircles] = useState<OrbitCircle[]>(SEED_CIRCLES);
  const [activeCircleId, setActiveCircleId] = useState<string>(SEED_CIRCLES[0].id);
  const [members, setMembers] = useState<OrbitMember[]>(() => createSeedMembers(DEFAULT_CENTER));
  const [selectedMemberId, setSelectedMemberId] = useState<string>('self');
  const [zones, setZones] = useState<GeofenceZone[]>(() => createSeedZones(DEFAULT_CENTER));
  const [trips, setTrips] = useState<DriveTrip[]>(SEED_TRIPS);
  const [feed, setFeed] = useState<OrbitFeedEvent[]>(SEED_FEED);
  const [contacts, setContacts] = useState<EmergencyContact[]>(SEED_CONTACTS);
  const [ghostMode, setGhostMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [simulatingDrive, setSimulatingDrive] = useState(false);
  const [liveBanner, setLiveBanner] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const hasAnchoredToRealGps = useRef(false);
  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const prevZonesByMember = useRef<Record<string, string | null>>({});

  const showBanner = useCallback((msg: string) => {
    setLiveBanner(msg);
    setTimeout(() => {
      setLiveBanner((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  const dismissBanner = useCallback(() => setLiveBanner(null), []);

  // Hydrate persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed: Partial<PersistedState> = JSON.parse(raw);
        if (parsed.circles?.length) setCircles(parsed.circles);
        if (parsed.activeCircleId) setActiveCircleId(parsed.activeCircleId);
        if (parsed.zones?.length) setZones(parsed.zones);
        if (parsed.trips?.length) setTrips(parsed.trips);
        if (parsed.feed?.length) setFeed(parsed.feed);
        if (parsed.contacts?.length) setContacts(parsed.contacts);
        if (typeof parsed.ghostMode === 'boolean') setGhostMode(parsed.ghostMode);
        if (parsed.profile) {
          setProfile(parsed.profile);
          setMembers((prev) =>
            prev.map((m) =>
              m.isSelf
                ? {
                    ...m,
                    name: parsed.profile!.name,
                    initials: parsed.profile!.initials,
                    avatarColor: parsed.profile!.avatarColor,
                    ghostMode: parsed.ghostMode ?? m.ghostMode,
                  }
                : m
            )
          );
        }
      } catch {
        // Ignore corrupt storage
      }
    })();
  }, []);

  // Persist changes
  useEffect(() => {
    const payload: PersistedState = {
      circles,
      activeCircleId,
      zones,
      trips: trips.slice(0, 30),
      feed: feed.slice(0, 40),
      contacts,
      ghostMode,
      profile,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [circles, activeCircleId, zones, trips, feed, contacts, ghostMode, profile]);

  // Helper to detect geofence entry/exit transitions
  const checkZoneTransitions = useCallback(
    (updatedMembers: OrbitMember[]) => {
      const currentZones = zonesRef.current;
      const newEvents: OrbitFeedEvent[] = [];

      for (const m of updatedMembers) {
        const prevZone = prevZonesByMember.current[m.id];
        const nextZone = m.currentZoneName;

        if (prevZone === undefined) {
          prevZonesByMember.current[m.id] = nextZone;
          continue;
        }

        if (prevZone !== nextZone) {
          if (nextZone) {
            const zObj = currentZones.find((z) => z.name === nextZone);
            if (zObj?.notifyOnArrive) {
              const msg = `${m.name} arrived at ${nextZone}`;
              newEvents.push({
                id: `f-${Date.now()}-${m.id}`,
                type: 'zone_arrive',
                memberName: m.name,
                message: `Arrived at ${nextZone}`,
                locationLabel: `${nextZone} Zone`,
                timestamp: Date.now(),
              });
              showBanner(msg);
            }
          } else if (prevZone) {
            const zObj = currentZones.find((z) => z.name === prevZone);
            if (zObj?.notifyOnLeave) {
              const msg = `${m.name} departed ${prevZone}`;
              newEvents.push({
                id: `f-${Date.now()}-${m.id}`,
                type: 'zone_leave',
                memberName: m.name,
                message: `Departed ${prevZone}`,
                locationLabel: `${prevZone} Zone`,
                timestamp: Date.now(),
              });
              showBanner(msg);
            }
          }
          prevZonesByMember.current[m.id] = nextZone;
        }
      }

      if (newEvents.length > 0) {
        setFeed((prev) => [...newEvents, ...prev]);
      }
    },
    [showBanner]
  );

  // Real battery telemetry
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        if (!mounted || level < 0) return;
        const pct = Math.round(level * 100);
        const charging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
        setMembers((prev) =>
          prev.map((m) => (m.isSelf ? { ...m, batteryPct: pct, isCharging: charging } : m))
        );
      } catch {
        // Ignore on simulators/web
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Real GPS location tracking
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let active = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status !== 'granted') {
          setLocationPermission('denied');
          return;
        }
        setLocationPermission('granted');

        const applyCoords = (coords: Coordinates, speedMs: number | null) => {
          const speedKmh = speedMs && speedMs > 0 ? Math.round(speedMs * 3.6) : 0;

          if (!hasAnchoredToRealGps.current) {
            hasAnchoredToRealGps.current = true;
            const seeded = createSeedMembers(coords).map((m) =>
              m.isSelf
                ? {
                    ...m,
                    name: profileRef.current.name,
                    initials: profileRef.current.initials,
                    avatarColor: profileRef.current.avatarColor,
                  }
                : m
            );
            setMembers(seeded);
            setZones(createSeedZones(coords));
            return;
          }

          setMembers((prev) => {
            const next = prev.map((m) => {
              if (!m.isSelf) return m;
              const zone = findContainingZone(coords, zonesRef.current);
              return {
                ...m,
                coords,
                speedKmh,
                motionState: inferMotionState(speedKmh),
                currentZoneName: zone ? zone.name : null,
                lastUpdatedAt: Date.now(),
              };
            });
            checkZoneTransitions(next);
            return next;
          });
        };

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (active) {
          applyCoords(
            { latitude: current.coords.latitude, longitude: current.coords.longitude },
            current.coords.speed
          );
        }

        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 8,
            timeInterval: 5000,
          },
          (loc) => {
            if (!active) return;
            applyCoords(
              { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
              loc.coords.speed
            );
          }
        );
      } catch {
        if (active) setLocationPermission('denied');
      }
    })();

    return () => {
      active = false;
      sub?.remove();
    };
  }, [checkZoneTransitions]);

  // Subtle live simulation for non-self Orbit members so the Radar feels alive
  useEffect(() => {
    const timer = setInterval(() => {
      setMembers((prev) => {
        const next = prev.map((m) => {
          if (m.isSelf || m.motionState === 'stationary') return m;
          const deltaScale = m.motionState === 'driving' ? 0.00045 : 0.00008;
          const nextCoords = {
            latitude: m.coords.latitude + (Math.random() - 0.45) * deltaScale,
            longitude: m.coords.longitude + (Math.random() - 0.45) * deltaScale,
          };
          const zone = findContainingZone(nextCoords, zonesRef.current);
          return {
            ...m,
            coords: nextCoords,
            currentZoneName: zone ? zone.name : null,
            lastUpdatedAt: Date.now(),
          };
        });
        checkZoneTransitions(next);
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [checkZoneTransitions]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev, ...patch };
      setMembers((mList) =>
        mList.map((m) =>
          m.isSelf
            ? {
                ...m,
                name: merged.name,
                initials: merged.initials,
                avatarColor: merged.avatarColor,
              }
            : m
        )
      );
      return merged;
    });
  }, []);

  const colors = useMemo(
    () => (profile.themeMode === 'light' ? LIGHT_THEME : DARK_THEME),
    [profile.themeMode]
  );

  const toggleThemeMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setProfile((prev) => ({
      ...prev,
      themeMode: prev.themeMode === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const activeCircle = useMemo(
    () => circles.find((c) => c.id === activeCircleId) ?? circles[0],
    [circles, activeCircleId]
  );

  const activeMembers = useMemo(
    () => members.filter((m) => activeCircle.memberIds.includes(m.id)),
    [members, activeCircle]
  );

  const selfMember = useMemo(
    () => members.find((m) => m.isSelf) ?? members[0],
    [members]
  );

  const switchCircle = useCallback((circleId: string) => {
    setActiveCircleId(circleId);
    setSelectedMemberId('self');
  }, []);

  const createCircle = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newCircle: OrbitCircle = {
      id: `c-${Date.now()}`,
      name: trimmed,
      inviteCode: generateInviteCode(),
      memberIds: ['self'],
      accentColor: '#00D2B4',
    };
    setCircles((prev) => [...prev, newCircle]);
    setActiveCircleId(newCircle.id);
  }, []);

  const joinCircleByCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (normalized.length < 4) return false;
      const existing = circles.find((c) => c.inviteCode === normalized);
      if (existing) {
        setActiveCircleId(existing.id);
        return true;
      }
      const joined: OrbitCircle = {
        id: `c-${Date.now()}`,
        name: `Orbit ${normalized}`,
        inviteCode: normalized,
        memberIds: ['self', 'm-ayesha'],
        accentColor: '#38BDF8',
      };
      setCircles((prev) => [...prev, joined]);
      setActiveCircleId(joined.id);
      return true;
    },
    [circles]
  );

  const toggleGhostMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setGhostMode((prev) => {
      const next = !prev;
      setMembers((mList) => mList.map((m) => (m.isSelf ? { ...m, ghostMode: next } : m)));
      return next;
    });
  }, []);

  const triggerSos = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    setSosActive(true);
    setMembers((prev) => prev.map((m) => (m.isSelf ? { ...m, sosActive: true } : m)));
    setFeed((prev) => [
      {
        id: `f-${Date.now()}`,
        type: 'sos',
        memberName: profileRef.current.name,
        message: 'SOS Beacon activated — live coordinates shared with Orbit & Emergency Contacts.',
        locationLabel: selfMember.currentZoneName ?? 'Live GPS Pin',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    showBanner('SOS Beacon Broadcasting to Orbit');
  }, [selfMember.currentZoneName, showBanner]);

  const resolveSos = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSosActive(false);
    setMembers((prev) => prev.map((m) => (m.isSelf ? { ...m, sosActive: false } : m)));
    setFeed((prev) => [
      {
        id: `f-${Date.now()}`,
        type: 'checkin',
        memberName: profileRef.current.name,
        message: 'SOS Beacon cleared — marked safe.',
        locationLabel: selfMember.currentZoneName ?? 'Live GPS Pin',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    showBanner('SOS cleared — marked safe');
  }, [selfMember.currentZoneName, showBanner]);

  const sendCheckIn = useCallback(
    (note?: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const label =
        selfMember.currentZoneName ??
        `${selfMember.coords.latitude.toFixed(4)}, ${selfMember.coords.longitude.toFixed(4)}`;
      setFeed((prev) => [
        {
          id: `f-${Date.now()}`,
          type: 'checkin',
          memberName: profileRef.current.name,
          message: note?.trim() ? note.trim() : `Checked in safely at ${label}`,
          locationLabel: label,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    },
    [selfMember]
  );

  const pingMember = useCallback(
    (memberId: string) => {
      const target = members.find((m) => m.id === memberId);
      if (!target) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setFeed((prev) => [
        {
          id: `f-${Date.now()}`,
          type: 'ping',
          memberName: profileRef.current.name,
          message: `Sent a location ping to ${target.name}`,
          locationLabel: target.currentZoneName ?? 'En route',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    },
    [members]
  );

  const startTestDrive = useCallback(() => {
    if (simulatingDrive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSimulatingDrive(true);
    showBanner('Test Drive started — watch Radar & Zones');

    let step = 0;
    const originZone = selfMember.currentZoneName ?? 'Current Pin';
    const interval = setInterval(() => {
      step += 1;
      setMembers((prev) => {
        const next = prev.map((m) => {
          if (!m.isSelf) return m;
          const speed = step >= 6 ? 0 : 38 + step * 5;
          const nextCoords = {
            latitude: m.coords.latitude + (step <= 3 ? 0.0012 : -0.0008),
            longitude: m.coords.longitude + (step <= 3 ? 0.001 : -0.0006),
          };
          const zone = findContainingZone(nextCoords, zonesRef.current);
          return {
            ...m,
            coords: nextCoords,
            speedKmh: speed,
            motionState: inferMotionState(speed),
            currentZoneName: zone ? zone.name : null,
            lastUpdatedAt: Date.now(),
          };
        });
        checkZoneTransitions(next);
        return next;
      });

      if (step >= 6) {
        clearInterval(interval);
        setSimulatingDrive(false);
        const newTrip: DriveTrip = {
          id: `t-${Date.now()}`,
          memberName: profileRef.current.name,
          originLabel: originZone,
          destinationLabel: 'Test Loop',
          distanceKm: 3.4,
          durationMin: 8,
          maxSpeedKmh: 63,
          safetyScore: 98,
          eventsCount: 0,
          timestamp: Date.now(),
        };
        setTrips((prev) => [newTrip, ...prev]);
        showBanner('Test Drive completed — Score 98 logged');
      }
    }, 1500);
  }, [simulatingDrive, selfMember.currentZoneName, checkZoneTransitions, showBanner]);

  const addZone = useCallback((zone: Omit<GeofenceZone, 'id'>) => {
    const newZone: GeofenceZone = { ...zone, id: `z-${Date.now()}` };
    setZones((prev) => [newZone, ...prev]);
  }, []);

  const updateZoneRadius = useCallback((zoneId: string, radiusMeters: number) => {
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, radiusMeters } : z)));
  }, []);

  const toggleZoneAlert = useCallback((zoneId: string, kind: 'arrive' | 'leave') => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        return kind === 'arrive'
          ? { ...z, notifyOnArrive: !z.notifyOnArrive }
          : { ...z, notifyOnLeave: !z.notifyOnLeave };
      })
    );
  }, []);

  const removeZone = useCallback((zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  }, []);

  const addEmergencyContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
    setContacts((prev) => [...prev, { ...contact, id: `ec-${Date.now()}` }]);
  }, []);

  const removeEmergencyContact = useCallback((contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  }, []);

  const resetDemoData = useCallback(() => {
    setCircles(SEED_CIRCLES);
    setActiveCircleId(SEED_CIRCLES[0].id);
    setTrips(SEED_TRIPS);
    setFeed(SEED_FEED);
    setContacts(SEED_CONTACTS);
    setGhostMode(false);
    setSosActive(false);
    showBanner('Demo data restored');
  }, [showBanner]);

  return (
    <OrbitContext.Provider
      value={{
        profile,
        colors,
        toggleThemeMode,
        updateProfile,
        circles,
        activeCircle,
        activeMembers,
        allMembers: members,
        selfMember,
        selectedMemberId,
        setSelectedMemberId,
        zones,
        trips,
        feed,
        contacts,
        ghostMode,
        sosActive,
        simulatingDrive,
        liveBanner,
        dismissBanner,
        locationPermission,
        switchCircle,
        createCircle,
        joinCircleByCode,
        toggleGhostMode,
        triggerSos,
        resolveSos,
        sendCheckIn,
        pingMember,
        startTestDrive,
        addZone,
        updateZoneRadius,
        toggleZoneAlert,
        removeZone,
        addEmergencyContact,
        removeEmergencyContact,
        resetDemoData,
      }}
    >
      {children}
    </OrbitContext.Provider>
  );
}

export function useOrbit() {
  const ctx = useContext(OrbitContext);
  if (!ctx) throw new Error('useOrbit must be used inside OrbitProvider');
  return ctx;
}
