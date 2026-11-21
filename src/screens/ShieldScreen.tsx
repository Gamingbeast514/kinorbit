import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrbit } from '../context/OrbitContext';
import { Colors, Radii, Spacing } from '../theme/tokens';
import { formatTimeAgo } from '../utils/geo';

export function ShieldScreen() {
  const insets = useSafeAreaInsets();
  const {
    selfMember,
    trips,
    ghostMode,
    toggleGhostMode,
    sosActive,
    triggerSos,
    resolveSos,
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
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.eyebrow}>SHIELD & TELEMETRY</Text>
      <Text style={styles.title}>Safety Command</Text>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Beacon Card */}
        <View style={[styles.sosCard, sosActive && styles.sosCardActive]}>
          <View style={styles.sosInfo}>
            <Text style={styles.sosTitle}>
              {sosActive
                ? 'SOS Beacon Broadcasting'
                : countdown !== null
                ? `Arming SOS in ${countdown}s...`
                : 'Emergency SOS Beacon'}
            </Text>
            <Text style={styles.sosSub}>
              {sosActive
                ? 'Your Orbit and Emergency Contacts are receiving your live GPS coordinates.'
                : 'Tap to start a 3-second countdown and alert your entire Orbit with your live pin.'}
            </Text>
          </View>

          {sosActive ? (
            <TouchableOpacity onPress={resolveSos} style={styles.safeBtn}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.textInverse} />
              <Text style={styles.safeBtnText}>Mark Safe</Text>
            </TouchableOpacity>
          ) : countdown !== null ? (
            <TouchableOpacity onPress={cancelCountdown} style={styles.cancelSosBtn}>
              <Text style={styles.cancelSosText}>Cancel ({countdown})</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startSosCountdown} style={styles.sosBtn}>
              <Ionicons name="warning" size={22} color={Colors.textPrimary} />
              <Text style={styles.sosBtnText}>SOS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Privacy & Live Telemetry */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.cardTitle}>Ghost Mode (Pause Sharing)</Text>
              <Text style={styles.cardSub}>
                Temporarily freeze your live pin on your Orbit map while keeping SOS ready.
              </Text>
            </View>
            <Switch
              value={ghostMode}
              onValueChange={toggleGhostMode}
              trackColor={{ false: Colors.bgElevated, true: Colors.accentAmberDim }}
              thumbColor={ghostMode ? Colors.accentAmber : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>SPEED</Text>
              <Text style={styles.metricValue}>{selfMember.speedKmh} km/h</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>BATTERY</Text>
              <Text style={styles.metricValue}>{selfMember.batteryPct}%</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>ZONE</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {selfMember.currentZoneName ?? 'Transit'}
              </Text>
            </View>
          </View>
        </View>

        {/* Drive Safety Trips */}
        <Text style={styles.sectionTitle}>Recent Drive Telemetry</Text>
        {trips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreValue}>{trip.safetyScore}</Text>
                <Text style={styles.scoreLabel}>SCORE</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tripRoute}>
                  {trip.originLabel} → {trip.destinationLabel}
                </Text>
                <Text style={styles.tripMeta}>
                  {trip.memberName} • {trip.distanceKm} km • {trip.durationMin} min •{' '}
                  {formatTimeAgo(trip.timestamp)}
                </Text>
              </View>
            </View>
            <View style={styles.tripStatsRow}>
              <Text style={styles.tripStat}>Max {trip.maxSpeedKmh} km/h</Text>
              <Text
                style={[
                  styles.tripStat,
                  {
                    color:
                      trip.eventsCount === 0 ? Colors.accentPrimary : Colors.accentAmber,
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
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.accentPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    gap: 14,
  },
  sosCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.accentCrimsonDim,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sosCardActive: {
    borderColor: Colors.accentCrimson,
    backgroundColor: Colors.accentCrimsonDim,
  },
  sosInfo: {
    flex: 1,
    gap: 4,
  },
  sosTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sosSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  sosBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sosBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  cancelSosBtn: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.accentCrimson,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelSosText: {
    color: Colors.accentCrimson,
    fontWeight: '800',
    fontSize: 12,
  },
  safeBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeBtnText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 12,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
    color: Colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.md,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
    backgroundColor: Colors.accentPrimaryDim,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.accentPrimary,
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.accentPrimary,
  },
  tripRoute: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tripMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 8,
  },
  tripStat: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
