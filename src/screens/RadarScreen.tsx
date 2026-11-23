import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleModal } from '../components/CircleModal';
import { MemberTelemetryStrip } from '../components/MemberTelemetryStrip';
import { OnboardingModal } from '../components/OnboardingModal';
import { OrbitHeader } from '../components/OrbitHeader';
import { RadarMapView } from '../components/RadarMapView';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';
import { OrbitMember } from '../types/orbit';

export function RadarScreen() {
  const insets = useSafeAreaInsets();
  const {
    selfMember,
    setSelectedMemberId,
    sendCheckIn,
    pingMember,
    sosActive,
    liveBanner,
    dismissBanner,
    profile,
    colors,
    locationPermission,
  } = useOrbit();

  const [circlesOpen, setCirclesOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState<{ member: OrbitMember; seq: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleFocusMember = (member: OrbitMember) => {
    setSelectedMemberId(member.id);
    setFocusTrigger((prev) => ({ member, seq: (prev?.seq ?? 0) + 1 }));
  };

  const handlePing = (member: OrbitMember) => {
    pingMember(member.id);
    showToast(`Location ping sent to ${member.name}`);
  };

  const handleCheckIn = () => {
    sendCheckIn();
    showToast('Checked in with your Orbit');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <RadarMapView focusTrigger={focusTrigger} />

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <OrbitHeader
          onOpenCircles={() => setCirclesOpen(true)}
          onQuickCheckIn={handleCheckIn}
        />

        {sosActive && (
          <View style={[styles.sosBanner, { backgroundColor: colors.accentCrimson }]}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.sosBannerText}>
              SOS BEACON ACTIVE — Live coordinates broadcasting
            </Text>
          </View>
        )}

        {liveBanner && !sosActive && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={dismissBanner}
            style={[
              styles.liveBanner,
              {
                backgroundColor: colors.bgGlass,
                borderColor: colors.borderAccent,
              },
            ]}
          >
            <Ionicons name="notifications" size={15} color={colors.accentPrimary} />
            <Text style={[styles.liveBannerText, { color: colors.textPrimary }]}>
              {liveBanner}
            </Text>
          </TouchableOpacity>
        )}

        {locationPermission === 'denied' && (
          <View
            style={[
              styles.permBanner,
              { backgroundColor: colors.bgGlass, borderColor: colors.accentAmber },
            ]}
          >
            <Ionicons name="location-outline" size={15} color={colors.accentAmber} />
            <Text style={[styles.permBannerText, { color: colors.accentAmber }]}>
              GPS permission denied — showing simulated Orbit coordinates
            </Text>
          </View>
        )}
      </View>

      {toast && (
        <View
          style={[
            styles.toast,
            { backgroundColor: colors.bgGlass, borderColor: colors.borderAccent },
          ]}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.accentPrimary} />
          <Text style={[styles.toastText, { color: colors.textPrimary }]}>{toast}</Text>
        </View>
      )}

      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 84 }]}>
        <View style={styles.recenterRow}>
          <TouchableOpacity
            onPress={() => handleFocusMember(selfMember)}
            style={[
              styles.recenterBtn,
              { backgroundColor: colors.bgGlass, borderColor: colors.borderSubtle },
            ]}
          >
            <Ionicons name="locate" size={18} color={colors.accentPrimary} />
          </TouchableOpacity>
        </View>
        <MemberTelemetryStrip
          onFocusMember={handleFocusMember}
          onPingMember={handlePing}
        />
      </View>

      <CircleModal visible={circlesOpen} onClose={() => setCirclesOpen(false)} />
      <OnboardingModal
        visible={!profile.onboarded && !onboardingDismissed}
        isFirstLaunch
        onClose={() => setOnboardingDismissed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
  },
  sosBanner: {
    marginHorizontal: Spacing.md,
    borderRadius: Radii.md,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  liveBanner: {
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  permBanner: {
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permBannerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: 10,
  },
  recenterRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
  },
  recenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
