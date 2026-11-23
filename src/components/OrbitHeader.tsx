import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';

interface OrbitHeaderProps {
  onOpenCircles: () => void;
  onQuickCheckIn: () => void;
}

export function OrbitHeader({ onOpenCircles, onQuickCheckIn }: OrbitHeaderProps) {
  const { activeCircle, colors, profile, toggleThemeMode, sosActive } = useOrbit();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggleThemeMode}
        style={[
          styles.iconBtn,
          { backgroundColor: colors.bgGlass, borderColor: colors.borderSubtle },
        ]}
      >
        <Ionicons
          name={profile.themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
          size={19}
          color={colors.textPrimary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenCircles}
        style={[
          styles.centerPill,
          {
            backgroundColor: sosActive ? colors.accentCrimson : colors.accentPrimary,
          },
        ]}
      >
        <Text style={styles.circleName}>{activeCircle.name}</Text>
        <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onQuickCheckIn}
        style={[
          styles.iconBtn,
          { backgroundColor: colors.bgGlass, borderColor: colors.borderSubtle },
        ]}
      >
        <Ionicons name="radio-outline" size={19} color={colors.accentPrimary} />
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
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radii.pill,
    paddingVertical: 9,
    paddingHorizontal: 20,
    elevation: 4,
  },
  circleName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
