import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Colors, Radii, Spacing } from '../theme/tokens';
import { OrbitMember } from '../types/orbit';
import { distanceMeters, formatDistance, formatSpeed, formatTimeAgo } from '../utils/geo';

interface MemberTelemetryStripProps {
  onFocusMember: (member: OrbitMember) => void;
  onPingMember: (member: OrbitMember) => void;
}

export function MemberTelemetryStrip({
  onFocusMember,
  onPingMember,
}: MemberTelemetryStripProps) {
  const { activeMembers, selfMember, selectedMemberId, profile } = useOrbit();

  const openDirections = (member: OrbitMember) => {
    const { latitude, longitude } = member.coords;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const renderMotionIcon = (state: OrbitMember['motionState']) => {
    if (state === 'driving') return 'car-sport-outline';
    if (state === 'walking') return 'walk-outline';
    return 'locate-outline';
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={activeMembers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedMemberId;
        const dist = item.isSelf
          ? 'Your Device'
          : `${formatDistance(distanceMeters(selfMember.coords, item.coords))} away`;

        const batteryColor =
          item.batteryPct <= 20 ? Colors.accentCrimson : Colors.accentPrimary;

        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onFocusMember(item)}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              item.sosActive && styles.cardSos,
            ]}
          >
            <View style={styles.topRow}>
              <View style={[styles.avatarRing, { borderColor: item.avatarColor }]}>
                <View style={[styles.avatarInner, { backgroundColor: item.avatarColor }]}>
                  <Text style={styles.initials}>{item.initials}</Text>
                </View>
              </View>

              <View style={styles.identityCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.ghostMode && (
                    <View style={styles.ghostPill}>
                      <Ionicons name="eye-off" size={10} color={Colors.accentAmber} />
                    </View>
                  )}
                </View>
                <Text style={styles.zoneText} numberOfLines={1}>
                  {item.currentZoneName ? `In ${item.currentZoneName}` : dist}
                </Text>
              </View>

              <View style={styles.batteryBadge}>
                <Ionicons
                  name={item.isCharging ? 'battery-charging' : 'battery-half'}
                  size={13}
                  color={batteryColor}
                />
                <Text style={[styles.batteryText, { color: batteryColor }]}>
                  {item.batteryPct}%
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.telemetryPill}>
                <Ionicons
                  name={renderMotionIcon(item.motionState)}
                  size={13}
                  color={Colors.textSecondary}
                />
                <Text style={styles.telemetryText}>
                  {item.motionState === 'stationary'
                    ? 'Stationary'
                    : formatSpeed(item.speedKmh, profile.speedUnit)}
                </Text>
              </View>

              <Text style={styles.timeText}>{formatTimeAgo(item.lastUpdatedAt)}</Text>

              {!item.isSelf && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => openDirections(item)}
                    style={styles.routeBtn}
                  >
                    <Ionicons name="navigate-outline" size={12} color={Colors.accentSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onPingMember(item)}
                    style={styles.pingBtn}
                  >
                    <Ionicons name="flash-outline" size={13} color={Colors.accentPrimary} />
                    <Text style={styles.pingText}>Ping</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  card: {
    width: 248,
    backgroundColor: Colors.bgGlass,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 14,
    gap: 12,
  },
  cardSelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.bgSecondary,
  },
  cardSos: {
    borderColor: Colors.accentCrimson,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  identityCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ghostPill: {
    backgroundColor: Colors.accentAmberDim,
    borderRadius: Radii.pill,
    padding: 3,
  },
  zoneText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    padding: 5,
    borderRadius: Radii.pill,
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accentPrimaryDim,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  pingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
});
