import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useOrbit } from '../context/OrbitContext';
import { KINORBIT_DARK_MAP_STYLE, KINORBIT_LIGHT_MAP_STYLE } from '../theme/tokens';
import { OrbitMember } from '../types/orbit';

interface RadarMapViewProps {
  focusTrigger: { member: OrbitMember; seq: number } | null;
}

export function RadarMapView({ focusTrigger }: RadarMapViewProps) {
  const {
    activeMembers,
    zones,
    selfMember,
    selectedMemberId,
    setSelectedMemberId,
    colors,
    profile,
  } = useOrbit();
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
      <View style={[styles.webFallback, { backgroundColor: colors.bgPrimary }]}>
        <View
          style={[
            styles.webRadarRingOuter,
            {
              borderColor: colors.borderAccent,
              backgroundColor: colors.accentPrimaryDim,
            },
          ]}
        >
          <View style={[styles.webRadarRingInner, { borderColor: colors.accentPrimary }]}>
            <Text style={[styles.webRadarTitle, { color: colors.textPrimary }]}>
              KinOrbit Live Radar
            </Text>
            <Text style={[styles.webRadarSub, { color: colors.textSecondary }]}>
              {activeMembers.length} members tracked • Open on Android / iOS for native map
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
      customMapStyle={
        profile.themeMode === 'light' ? KINORBIT_LIGHT_MAP_STYLE : KINORBIT_DARK_MAP_STYLE
      }
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
          fillColor={`${zone.color}24`}
        />
      ))}

      {activeMembers.map((member) => {
        const isSelected = member.id === selectedMemberId;
        const pinColor = member.sosActive
          ? colors.accentCrimson
          : member.isSelf
          ? profile.themeMode === 'light'
            ? colors.accentViolet
            : colors.accentMint
          : member.avatarColor;

        return (
          <Marker
            key={member.id}
            coordinate={member.coords}
            onPress={() => setSelectedMemberId(member.id)}
            anchor={{ x: 0.5, y: 0.85 }}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.pinBubble,
                  {
                    backgroundColor: pinColor,
                    transform: [{ scale: isSelected ? 1.14 : 1 }],
                  },
                ]}
              >
                <View style={[styles.pinAvatar, { backgroundColor: colors.bgSecondary }]}>
                  <Text style={[styles.markerInitials, { color: colors.textPrimary }]}>
                    {member.initials}
                  </Text>
                </View>
              </View>
              <View style={[styles.pinPointer, { borderTopColor: pinColor }]} />
              <View
                style={[
                  styles.nameTag,
                  {
                    backgroundColor: colors.bgGlass,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.nameTagText, { color: colors.textPrimary }]}>
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
  },
  pinBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pinAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  markerInitials: {
    fontSize: 12,
    fontWeight: '800',
  },
  nameTag: {
    marginTop: 3,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  nameTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  webFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRadarRingOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRadarRingInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  webRadarTitle: {
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
  webRadarSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
