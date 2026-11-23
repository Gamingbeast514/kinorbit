import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrbit } from '../context/OrbitContext';
import { Radii, Spacing } from '../theme/tokens';
import { GeofenceZone } from '../types/orbit';
import { distanceMeters, formatDistance } from '../utils/geo';

const RADIUS_OPTIONS = [150, 250, 500, 1000];
const ZONE_COLORS = ['#27D38B', '#8B75FF', '#FF9F2E', '#FF5A5F'];

export function ZonesScreen() {
  const insets = useSafeAreaInsets();
  const { zones, selfMember, colors, addZone, updateZoneRadius, toggleZoneAlert, removeZone } =
    useOrbit();
  const [modalVisible, setModalVisible] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [radius, setRadius] = useState(250);
  const [color, setColor] = useState(ZONE_COLORS[0]);

  const handleCreateZone = () => {
    if (!zoneName.trim()) return;
    addZone({
      name: zoneName.trim(),
      icon: 'pin',
      coords: { ...selfMember.coords },
      radiusMeters: radius,
      notifyOnArrive: true,
      notifyOnLeave: true,
      color,
    });
    setZoneName('');
    setModalVisible(false);
  };

  const renderZoneIcon = (icon: GeofenceZone['icon']) => {
    if (icon === 'home') return 'home-outline';
    if (icon === 'briefcase') return 'briefcase-outline';
    if (icon === 'school') return 'school-outline';
    if (icon === 'fitness') return 'barbell-outline';
    return 'location-outline';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: colors.bgPrimary }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accentPrimary }]}>GEOFENCE ZONES</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Smart Perimeter Alerts</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Zone</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {zones.map((zone) => {
          const dist = distanceMeters(selfMember.coords, zone.coords);
          const inside = dist <= zone.radiusMeters;
          return (
            <View
              key={zone.id}
              style={[
                styles.zoneCard,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
              ]}
            >
              <View style={styles.zoneTop}>
                <View style={[styles.iconWrap, { backgroundColor: `${zone.color}22` }]}>
                  <Ionicons name={renderZoneIcon(zone.icon)} size={20} color={zone.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.zoneTitleRow}>
                    <Text style={[styles.zoneName, { color: colors.textPrimary }]}>{zone.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: inside
                            ? colors.accentPrimaryDim
                            : colors.bgElevated,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: inside ? colors.accentPrimary : colors.textSecondary },
                        ]}
                      >
                        {inside ? 'Inside Zone' : `${formatDistance(dist)} away`}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.zoneMeta, { color: colors.textSecondary }]}>
                    Radius: {zone.radiusMeters} m
                  </Text>
                </View>

                <TouchableOpacity onPress={() => removeZone(zone.id)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.inlineRadiusRow}>
                {RADIUS_OPTIONS.map((opt) => {
                  const active = zone.radiusMeters === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => updateZoneRadius(zone.id, opt)}
                      style={[
                        styles.inlineChip,
                        {
                          backgroundColor: active ? colors.accentPrimaryDim : colors.bgElevated,
                          borderColor: active ? colors.accentPrimary : colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.inlineChipText,
                          { color: active ? colors.accentPrimary : colors.textSecondary },
                        ]}
                      >
                        {opt >= 1000 ? '1 km' : `${opt}m`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
                  Notify on Arrival
                </Text>
                <Switch
                  value={zone.notifyOnArrive}
                  onValueChange={() => toggleZoneAlert(zone.id, 'arrive')}
                  trackColor={{ false: colors.bgElevated, true: colors.accentPrimaryDim }}
                  thumbColor={zone.notifyOnArrive ? colors.accentPrimary : colors.textMuted}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
                  Notify on Departure
                </Text>
                <Switch
                  value={zone.notifyOnLeave}
                  onValueChange={() => toggleZoneAlert(zone.id, 'leave')}
                  trackColor={{ false: colors.bgElevated, true: colors.accentPrimaryDim }}
                  thumbColor={zone.notifyOnLeave ? colors.accentPrimary : colors.textMuted}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Pin New Zone at Current Location
            </Text>
            <TextInput
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="Zone name (e.g. Gym, Library)"
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

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Perimeter Radius
            </Text>
            <View style={styles.chipRow}>
              {RADIUS_OPTIONS.map((opt) => {
                const active = radius === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setRadius(opt)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.accentPrimaryDim : colors.bgElevated,
                        borderColor: active ? colors.accentPrimary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.accentPrimary : colors.textSecondary },
                      ]}
                    >
                      {opt >= 1000 ? '1 km' : `${opt} m`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Ring Color</Text>
            <View style={styles.chipRow}>
              {ZONE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    color === c && { borderWidth: 3, borderColor: colors.textPrimary },
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.cancelBtn, { backgroundColor: colors.bgElevated }]}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateZone}
                style={[styles.saveBtn, { backgroundColor: colors.accentPrimary }]}
              >
                <Text style={styles.saveText}>Create Zone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    gap: 12,
  },
  zoneCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 10,
  },
  zoneTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  zoneMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  trashBtn: {
    padding: 6,
  },
  inlineRadiusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineChip: {
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  inlineChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,9,11,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
