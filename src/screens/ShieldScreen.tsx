import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';
import { formatSpeed, formatTimeAgo } from '../utils/geo';

export function ShieldScreen() {
  const insets = useSafeAreaInsets();
  const {
    selfMember,
    profile,
    colors,
    trips,
    contacts,
    ghostMode,
    toggleGhostMode,
    sosActive,
    triggerSos,
    resolveSos,
    simulatingDrive,
    startTestDrive,
  } = useOrbit();

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startSosCountdown = () => {
    if (sosActive || countdown !== null) return;
    setCountdown(3);
    let remaining = 3;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);
        triggerSos();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: colors.bgPrimary }]}>
      <Text style={[styles.eyebrow, { color: colors.accentPrimary }]}>SHIELD & TELEMETRY</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Safety Command</Text>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.sosCard,
            {
              backgroundColor: sosActive ? colors.accentCrimsonDim : colors.bgSecondary,
              borderColor: sosActive ? colors.accentCrimson : colors.accentCrimsonDim,
            },
          ]}
        >
          <View style={styles.sosInfo}>
            <Text style={[styles.sosTitle, { color: colors.textPrimary }]}>
              {sosActive
                ? 'SOS Beacon Broadcasting'
                : countdown !== null
                ? `Arming SOS in ${countdown}s...`
                : 'Emergency SOS Beacon'}
            </Text>
            <Text style={[styles.sosSub, { color: colors.textSecondary }]}>
              {sosActive
                ? 'Your Orbit and Emergency Contacts are receiving your live GPS coordinates.'
                : 'Tap to start a 3-second countdown and alert your entire Orbit with your live pin.'}
            </Text>
          </View>

          {sosActive ? (
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={resolveSos}
                style={[styles.safeBtn, { backgroundColor: colors.accentMint }]}
              >
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.safeBtnText}>Mark Safe</Text>
              </TouchableOpacity>
              {contacts[0] && (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(`tel:${contacts[0].phone.replace(/\s+/g, '')}`).catch(() => {})
                  }
                  style={[styles.callContactBtn, { backgroundColor: colors.accentCrimson }]}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                  <Text style={styles.callContactText}>Call {contacts[0].name.split(' ')[0]}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : countdown !== null ? (
            <TouchableOpacity
              onPress={cancelCountdown}
              style={[
                styles.cancelSosBtn,
                { backgroundColor: colors.bgElevated, borderColor: colors.accentCrimson },
              ]}
            >
              <Text style={[styles.cancelSosText, { color: colors.accentCrimson }]}>
                Cancel ({countdown})
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={startSosCountdown}
              style={[styles.sosBtn, { backgroundColor: colors.accentCrimson }]}
            >
              <Ionicons name="warning" size={22} color="#FFFFFF" />
              <Text style={styles.sosBtnText}>SOS</Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Ghost Mode (Pause Sharing)
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                Temporarily freeze your live pin on your Orbit map while keeping SOS ready.
              </Text>
            </View>
            <Switch
              value={ghostMode}
              onValueChange={toggleGhostMode}
              trackColor={{ false: colors.bgElevated, true: colors.accentAmberDim }}
              thumbColor={ghostMode ? colors.accentAmber : colors.textMuted}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.metricsGrid}>
            <View style={[styles.metricBox, { backgroundColor: colors.bgElevated }]}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>SPEED</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {formatSpeed(selfMember.speedKmh, profile.speedUnit)}
              </Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.bgElevated }]}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>BATTERY</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {selfMember.batteryPct}%
              </Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.bgElevated }]}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>ZONE</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {selfMember.currentZoneName ?? 'Transit'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tripHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Recent Drive Telemetry
          </Text>
          <TouchableOpacity
            onPress={startTestDrive}
            disabled={simulatingDrive}
            style={[
              styles.simBtn,
              {
                backgroundColor: simulatingDrive ? colors.accentPrimary : colors.accentPrimaryDim,
                borderColor: colors.borderAccent,
              },
            ]}
          >
            <Ionicons
              name={simulatingDrive ? 'car-sport' : 'play-outline'}
              size={13}
              color={simulatingDrive ? '#FFFFFF' : colors.accentPrimary}
            />
            <Text
              style={[
                styles.simBtnText,
                { color: simulatingDrive ? '#FFFFFF' : colors.accentPrimary },
              ]}
            >
              {simulatingDrive ? 'Driving...' : 'Simulate Drive'}
            </Text>
          </TouchableOpacity>
        </View>

        {trips.map((trip) => (
          <View
            key={trip.id}
            style={[
              styles.tripCard,
              { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
            ]}
          >
            <View style={styles.tripTop}>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: colors.accentMintDim, borderColor: colors.accentMint },
                ]}
              >
                <Text style={[styles.scoreValue, { color: colors.accentMint }]}>
                  {trip.safetyScore}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.accentMint }]}>SCORE</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tripRoute, { color: colors.textPrimary }]}>
                  {trip.originLabel} → {trip.destinationLabel}
                </Text>
                <Text style={[styles.tripMeta, { color: colors.textSecondary }]}>
                  {trip.memberName} • {trip.distanceKm} km • {trip.durationMin} min •{' '}
                  {formatTimeAgo(trip.timestamp)}
                </Text>
              </View>
            </View>
            <View style={[styles.tripStatsRow, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.tripStat, { color: colors.textSecondary }]}>
                Max {formatSpeed(trip.maxSpeedKmh, profile.speedUnit)}
              </Text>
              <Text
                style={[
                  styles.tripStat,
                  {
                    color: trip.eventsCount === 0 ? colors.accentMint : colors.accentAmber,
                  },
                ]}
              >
                {trip.eventsCount === 0
                  ? 'Smooth drive'
                  : `${trip.eventsCount} hard-brake event`}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    gap: 14,
  },
  sosCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sosInfo: {
    flex: 1,
    gap: 4,
  },
  sosTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sosSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  sosBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sosBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelSosBtn: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelSosText: {
    fontWeight: '800',
    fontSize: 12,
  },
  safeBtn: {
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  callContactBtn: {
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  callContactText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  tripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  divider: {
    height: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    borderRadius: Radii.md,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tripCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 10,
  },
  tripTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
  },
  tripRoute: {
    fontSize: 15,
    fontWeight: '700',
  },
  tripMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tripStat: {
    fontSize: 12,
    fontWeight: '600',
  },
});
