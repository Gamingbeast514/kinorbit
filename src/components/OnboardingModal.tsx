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
import { Colors, Radii, Spacing } from '../theme/tokens';

const AVATAR_COLORS = ['#00D2B4', '#38BDF8', '#FFB020', '#A78BFA', '#FB7185'];

interface OnboardingModalProps {
  visible: boolean;
  isFirstLaunch?: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, isFirstLaunch, onClose }: OnboardingModalProps) {
  const { profile, updateProfile } = useOrbit();
  const [name, setName] = useState(profile.name === 'You' ? '' : profile.name);
  const [color, setColor] = useState(profile.avatarColor);
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>(profile.speedUnit);

  useEffect(() => {
    if (visible) {
      setName(profile.name === 'You' ? '' : profile.name);
      setColor(profile.avatarColor);
      setSpeedUnit(profile.speedUnit);
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
      onboarded: true,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={[styles.previewRing, { borderColor: color }]}>
              <View style={[styles.previewCore, { backgroundColor: color }]}>
                <Text style={styles.previewInitials}>{computeInitials(name || 'You')}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>
                {isFirstLaunch ? 'WELCOME TO KINORBIT' : 'ORBIT PROFILE'}
              </Text>
              <Text style={styles.title}>
                {isFirstLaunch ? 'Set Up Your Beacon' : 'Customize Identity'}
              </Text>
            </View>
            {!isFirstLaunch && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Danyal"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Beacon Ring Color</Text>
          <View style={styles.row}>
            {AVATAR_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.label}>Telemetry Speed Unit</Text>
          <View style={styles.row}>
            {(['kmh', 'mph'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setSpeedUnit(u)}
                style={[styles.unitChip, speedUnit === u && styles.unitChipActive]}
              >
                <Text style={[styles.unitText, speedUnit === u && styles.unitTextActive]}>
                  {u === 'kmh' ? 'km/h' : 'mph'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.ctaBtn}>
            <Text style={styles.ctaText}>
              {isFirstLaunch ? 'Enter KinOrbit' : 'Save Profile'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 11, 0.84)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    padding: Spacing.lg,
    gap: 14,
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
    color: Colors.textInverse,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.accentPrimary,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: Colors.bgElevated,
    padding: 7,
    borderRadius: Radii.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.textPrimary,
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
  swatchActive: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  unitChip: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  unitChipActive: {
    backgroundColor: Colors.accentPrimaryDim,
    borderColor: Colors.accentPrimary,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  unitTextActive: {
    color: Colors.accentPrimary,
  },
  ctaBtn: {
    marginTop: 6,
    backgroundColor: Colors.accentPrimary,
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
    color: Colors.textInverse,
  },
});
