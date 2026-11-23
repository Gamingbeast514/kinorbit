import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';

const AVATAR_COLORS = ['#27D38B', '#8B75FF', '#FF9F2E', '#FF5A5F', '#38BDF8'];

interface OnboardingModalProps {
  visible: boolean;
  isFirstLaunch?: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, isFirstLaunch, onClose }: OnboardingModalProps) {
  const { profile, colors, updateProfile } = useOrbit();
  const [name, setName] = useState(profile.name === 'You' ? '' : profile.name);
  const [color, setColor] = useState(profile.avatarColor);
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>(profile.speedUnit);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(profile.themeMode);

  useEffect(() => {
    if (visible) {
      setName(profile.name === 'You' ? '' : profile.name);
      setColor(profile.avatarColor);
      setSpeedUnit(profile.speedUnit);
      setThemeMode(profile.themeMode);
    }
  }, [visible, profile]);

  const computeInitials = (raw: string) => {
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'YO';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSave = () => {
    const finalName = name.trim() || 'You';
    updateProfile({
      name: finalName,
      initials: computeInitials(finalName),
      avatarColor: color,
      speedUnit,
      themeMode,
      onboarded: true,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderAccent },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={[styles.previewRing, { borderColor: color }]}>
              <View style={[styles.previewCore, { backgroundColor: color }]}>
                <Text style={styles.previewInitials}>{computeInitials(name || 'You')}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: colors.accentPrimary }]}>
                {isFirstLaunch ? 'WELCOME TO KINORBIT' : 'ORBIT PROFILE'}
              </Text>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {isFirstLaunch ? 'Set Up Your Beacon' : 'Customize Identity'}
              </Text>
            </View>
            {!isFirstLaunch && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.bgElevated }]}
              >
                <Ionicons name="close" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Danyal"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: colors.bgPrimary,
                borderColor: colors.borderSubtle,
                color: colors.textPrimary,
              },
            ]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Beacon Ring Color</Text>
          <View style={styles.row}>
            {AVATAR_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && { borderWidth: 3, borderColor: colors.textPrimary },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>App Theme</Text>
          <View style={styles.row}>
            {(['dark', 'light'] as const).map((mode) => {
              const active = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.unitChip,
                    {
                      backgroundColor: active ? colors.accentPrimaryDim : colors.bgElevated,
                      borderColor: active ? colors.accentPrimary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      { color: active ? colors.accentPrimary : colors.textSecondary },
                    ]}
                  >
                    {mode === 'dark' ? 'Dark Navy' : 'Light Mint'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Telemetry Speed Unit</Text>
          <View style={styles.row}>
            {(['kmh', 'mph'] as const).map((u) => {
              const active = speedUnit === u;
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => setSpeedUnit(u)}
                  style={[
                    styles.unitChip,
                    {
                      backgroundColor: active ? colors.accentPrimaryDim : colors.bgElevated,
                      borderColor: active ? colors.accentPrimary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      { color: active ? colors.accentPrimary : colors.textSecondary },
                    ]}
                  >
                    {u === 'kmh' ? 'km/h' : 'mph'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.ctaBtn, { backgroundColor: colors.accentPrimary }]}
          >
            <Text style={styles.ctaText}>
              {isFirstLaunch ? 'Enter KinOrbit' : 'Save Profile'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 11, 0.8)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInitials: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    padding: 7,
    borderRadius: Radii.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  unitChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  ctaBtn: {
    marginTop: 6,
    borderRadius: Radii.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
