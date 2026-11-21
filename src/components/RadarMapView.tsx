import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useOrbit } from '../context/OrbitContext';
import { Colors, KINORBIT_MAP_STYLE } from '../theme/tokens';
import { OrbitMember } from '../types/orbit';

interface RadarMapViewProps {
  focusTrigger: { member: OrbitMember; seq: number } | null;
}

export function RadarMapView({ focusTrigger }: RadarMapViewProps) {
  const { activeMembers, zones, selfMember, selectedMemberId, setSelectedMemberId } = useOrbit();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!focusTrigger || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: focusTrigger.member.coords.latitude,
        longitude: focusTrigger.member.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      450
    );
  }, [focusTrigger]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <View style={styles.webRadarRingOuter}>
          <View style={styles.webRadarRingInner}>
            <Text style={styles.webRadarTitle}>KinOrbit Live Radar</Text>
            <Text style={styles.webRadarSub}>
              {activeMembers.length} members tracked • Open on Android / iOS for native interactive map
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_DEFAULT}
      customMapStyle={KINORBIT_MAP_STYLE}
      showsCompass={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      initialRegion={{
        latitude: selfMember.coords.latitude,
        longitude: selfMember.coords.longitude,
        latitudeDelta: 0.028,
        longitudeDelta: 0.028,
      }}
    >
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={zone.coords}
          radius={zone.radiusMeters}
          strokeWidth={1.5}
          strokeColor={zone.color}
          fillColor={`${zone.color}22`}
        />
      ))}

      {activeMembers.map((member) => {
        const isSelected = member.id === selectedMemberId;
        const ringColor = member.sosActive ? Colors.accentCrimson : member.avatarColor;
        return (
          <Marker
            key={member.id}
            coordinate={member.coords}
            onPress={() => setSelectedMemberId(member.id)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.outerHalo,
                  {
                    borderColor: ringColor,
                    backgroundColor: `${ringColor}28`,
                    transform: [{ scale: isSelected ? 1.15 : 1 }],
                  },
                ]}
              >
                <View style={[styles.markerCore, { backgroundColor: ringColor }]}>
                  <Text style={styles.markerInitials}>{member.initials}</Text>
                </View>
              </View>
              <View style={styles.nameTag}>
                <Text style={styles.nameTagText}>
                  {member.name}
                  {member.motionState === 'driving' ? ` • ${member.speedKmh} km/h` : ''}
                </Text>
              </View>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerWrap: {
    alignItems: 'center',
    gap: 4,
  },
  outerHalo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCore: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  nameTag: {
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  nameTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  webFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRadarRingOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentPrimaryDim,
  },
  webRadarRingInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  webRadarTitle: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
  webRadarSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
