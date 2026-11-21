import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Colors, Radii, Spacing } from '../theme/tokens';

interface OrbitHeaderProps {
  onOpenCircles: () => void;
  onQuickCheckIn: () => void;
}

export function OrbitHeader({ onOpenCircles, onQuickCheckIn }: OrbitHeaderProps) {
  const { activeCircle, activeMembers, ghostMode, sosActive } = useOrbit();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenCircles}
        style={styles.circlePill}
      >
        <View
          style={[
            styles.pulseDot,
            {
              backgroundColor: sosActive
                ? Colors.accentCrimson
                : ghostMode
                ? Colors.accentAmber
                : Colors.accentPrimary,
            },
          ]}
        />
        <View>
          <Text style={styles.brandLabel}>KINORBIT</Text>
          <View style={styles.circleRow}>
            <Text style={styles.circleName}>{activeCircle.name}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{activeMembers.length}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onQuickCheckIn}
        style={styles.checkInBtn}
      >
        <Ionicons name="radio-outline" size={16} color={Colors.textInverse} />
        <Text style={styles.checkInText}>Check In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  circlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: Colors.accentPrimary,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  circleName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.accentPrimaryDim,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.pill,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  checkInText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverse,
  },
});
