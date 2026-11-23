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
import { Colors, Radii, Spacing } from '../theme/tokens';
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
    <View style={styles.container}>
      <RadarMapView focusTrigger={focusTrigger} />

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <OrbitHeader
          onOpenCircles={() => setCirclesOpen(true)}
          onQuickCheckIn={handleCheckIn}
        />

        {sosActive && (
          <View style={styles.sosBanner}>
            <Ionicons name="warning" size={16} color={Colors.textPrimary} />
            <Text style={styles.sosBannerText}>
              SOS BEACON ACTIVE — Live coordinates broadcasting
            </Text>
          </View>
        )}

        {liveBanner && !sosActive && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={dismissBanner}
            style={styles.liveBanner}
          >
            <Ionicons name="notifications" size={15} color={Colors.accentPrimary} />
            <Text style={styles.liveBannerText}>{liveBanner}</Text>
          </TouchableOpacity>
        )}

        {locationPermission === 'denied' && (
          <View style={styles.permBanner}>
            <Ionicons name="location-outline" size={15} color={Colors.accentAmber} />
            <Text style={styles.permBannerText}>
              GPS permission denied — showing simulated Orbit coordinates
            </Text>
          </View>
        )}
      </View>

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.accentPrimary} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 84 }]}>
        <View style={styles.recenterRow}>
          <TouchableOpacity
            onPress={() => handleFocusMember(selfMember)}
            style={styles.recenterBtn}
          >
            <Ionicons name="locate" size={18} color={Colors.accentPrimary} />
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
    backgroundColor: Colors.bgPrimary,
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
    backgroundColor: Colors.accentCrimson,
    borderRadius: Radii.md,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosBannerText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  liveBanner: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.md,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBannerText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  permBanner: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.accentAmber,
    borderRadius: Radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permBannerText: {
    color: Colors.accentAmber,
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
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: {
    color: Colors.textPrimary,
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
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
