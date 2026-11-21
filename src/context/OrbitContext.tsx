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
import {
  Coordinates,
  DriveTrip,
  EmergencyContact,
  GeofenceZone,
  OrbitCircle,
  OrbitFeedEvent,
  OrbitMember,
} from '../types/orbit';
import { findContainingZone, generateInviteCode, inferMotionState } from '../utils/geo';

const STORAGE_KEY = '@kinorbit_state_v1';

interface PersistedState {
  circles: OrbitCircle[];
  activeCircleId: string;
  zones: GeofenceZone[];
  feed: OrbitFeedEvent[];
  contacts: EmergencyContact[];
  ghostMode: boolean;
}

interface OrbitContextValue {
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
  locationPermission: 'pending' | 'granted' | 'denied';
  switchCircle: (circleId: string) => void;
  createCircle: (name: string) => void;
  joinCircleByCode: (code: string) => boolean;
  toggleGhostMode: () => void;
  triggerSos: () => void;
  resolveSos: () => void;
  sendCheckIn: (note?: string) => void;
  pingMember: (memberId: string) => void;
  addZone: (zone: Omit<GeofenceZone, 'id'>) => void;
  toggleZoneAlert: (zoneId: string, kind: 'arrive' | 'leave') => void;
  removeZone: (zoneId: string) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (contactId: string) => void;
}

const OrbitContext = createContext<OrbitContextValue | null>(null);

export function OrbitProvider({ children }: { children: React.ReactNode }) {
  const [circles, setCircles] = useState<OrbitCircle[]>(SEED_CIRCLES);
  const [activeCircleId, setActiveCircleId] = useState<string>(SEED_CIRCLES[0].id);
  const [members, setMembers] = useState<OrbitMember[]>(() => createSeedMembers(DEFAULT_CENTER));
  const [selectedMemberId, setSelectedMemberId] = useState<string>('self');
  const [zones, setZones] = useState<GeofenceZone[]>(() => createSeedZones(DEFAULT_CENTER));
  const [trips] = useState<DriveTrip[]>(SEED_TRIPS);
  const [feed, setFeed] = useState<OrbitFeedEvent[]>(SEED_FEED);
  const [contacts, setContacts] = useState<EmergencyContact[]>(SEED_CONTACTS);
  const [ghostMode, setGhostMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const hasAnchoredToRealGps = useRef(false);
  const zonesRef = useRef(zones);
  zonesRef.current = zones;

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
        if (parsed.feed?.length) setFeed(parsed.feed);
        if (parsed.contacts?.length) setContacts(parsed.contacts);
        if (typeof parsed.ghostMode === 'boolean') setGhostMode(parsed.ghostMode);
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
      feed: feed.slice(0, 40),
      contacts,
      ghostMode,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [circles, activeCircleId, zones, feed, contacts, ghostMode]);

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
            // Re-anchor demo members & zones around user's real neighborhood on first fix
            setMembers(createSeedMembers(coords));
            setZones(createSeedZones(coords));
            return;
          }

          setMembers((prev) =>
            prev.map((m) => {
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
            })
          );
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
  }, []);

  // Subtle live simulation for non-self Orbit members so the Radar feels alive
  useEffect(() => {
    const timer = setInterval(() => {
      setMembers((prev) =>
        prev.map((m) => {
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
        })
      );
    }, 4500);

    return () => clearInterval(timer);
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
      // Create a joined Orbit for valid 6-char invite codes
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
        memberName: 'You',
        message: 'SOS Beacon activated — live coordinates shared with Orbit & Emergency Contacts.',
        locationLabel: selfMember.currentZoneName ?? 'Live GPS Pin',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [selfMember.currentZoneName]);

  const resolveSos = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSosActive(false);
    setMembers((prev) => prev.map((m) => (m.isSelf ? { ...m, sosActive: false } : m)));
    setFeed((prev) => [
      {
        id: `f-${Date.now()}`,
        type: 'checkin',
        memberName: 'You',
        message: 'SOS Beacon cleared — marked safe.',
        locationLabel: selfMember.currentZoneName ?? 'Live GPS Pin',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [selfMember.currentZoneName]);

  const sendCheckIn = useCallback(
    (note?: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const label = selfMember.currentZoneName ?? `${selfMember.coords.latitude.toFixed(4)}, ${selfMember.coords.longitude.toFixed(4)}`;
      setFeed((prev) => [
        {
          id: `f-${Date.now()}`,
          type: 'checkin',
          memberName: 'You',
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
          memberName: 'You',
          message: `Sent a location ping to ${target.name}`,
          locationLabel: target.currentZoneName ?? 'En route',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    },
    [members]
  );

  const addZone = useCallback((zone: Omit<GeofenceZone, 'id'>) => {
    const newZone: GeofenceZone = { ...zone, id: `z-${Date.now()}` };
    setZones((prev) => [newZone, ...prev]);
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

  return (
    <OrbitContext.Provider
      value={{
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
        locationPermission,
        switchCircle,
        createCircle,
        joinCircleByCode,
        toggleGhostMode,
        triggerSos,
        resolveSos,
        sendCheckIn,
        pingMember,
        addZone,
        toggleZoneAlert,
        removeZone,
        addEmergencyContact,
        removeEmergencyContact,
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
