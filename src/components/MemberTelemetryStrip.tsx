import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';
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
  const { activeMembers, selfMember, selectedMemberId, profile, colors } = useOrbit();

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
          item.batteryPct <= 20 ? colors.accentCrimson : colors.accentMint;

        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onFocusMember(item)}
            style={[
              styles.card,
              {
                backgroundColor: isSelected ? colors.bgSecondary : colors.bgGlass,
                borderColor: item.sosActive
                  ? colors.accentCrimson
                  : isSelected
                  ? colors.accentPrimary
                  : colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.topRow}>
              <View style={[styles.avatarRing, { borderColor: item.avatarColor }]}>
                <View style={[styles.avatarInner, { backgroundColor: item.avatarColor }]}>
                  <Text style={styles.initials}>{item.initials}</Text>
                </View>
                <View
                  style={[
                    styles.statusDotBadge,
                    {
                      backgroundColor:
                        item.batteryPct <= 20 || item.sosActive
                          ? colors.accentCrimson
                          : colors.accentMint,
                      borderColor: colors.bgSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.batteryPct <= 20 ? 'alert' : 'shield-checkmark'}
                    size={8}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.identityCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.ghostMode && (
                    <View style={[styles.ghostPill, { backgroundColor: colors.accentAmberDim }]}>
                      <Ionicons name="eye-off" size={10} color={colors.accentAmber} />
                    </View>
                  )}
                </View>
                <Text style={[styles.zoneText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.currentZoneName ? `In ${item.currentZoneName}` : dist}
                </Text>
              </View>

              <View style={[styles.batteryBadge, { backgroundColor: colors.bgElevated }]}>
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
              <View style={[styles.telemetryPill, { backgroundColor: colors.bgElevated }]}>
                <Ionicons
                  name={renderMotionIcon(item.motionState)}
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={[styles.telemetryText, { color: colors.textSecondary }]}>
                  {item.motionState === 'stationary'
                    ? 'Stationary'
                    : formatSpeed(item.speedKmh, profile.speedUnit)}
                </Text>
              </View>

              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTimeAgo(item.lastUpdatedAt)}
              </Text>

              {!item.isSelf && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => openDirections(item)}
                    style={[styles.routeBtn, { backgroundColor: colors.accentVioletDim }]}
                  >
                    <Ionicons name="navigate-outline" size={12} color={colors.accentViolet} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onPingMember(item)}
                    style={[styles.pingBtn, { backgroundColor: colors.accentPrimaryDim }]}
                  >
                    <Ionicons name="flash-outline" size={13} color={colors.accentPrimary} />
                    <Text style={[styles.pingText, { color: colors.accentPrimary }]}>Ping</Text>
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
    width: 252,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  statusDotBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
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
  },
  ghostPill: {
    borderRadius: Radii.pill,
    padding: 3,
  },
  zoneText: {
    fontSize: 12,
    marginTop: 2,
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeBtn: {
    padding: 5,
    borderRadius: Radii.pill,
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  pingText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
