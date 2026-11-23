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
import { Colors, Radii, Spacing } from '../theme/tokens';
import { GeofenceZone } from '../types/orbit';
import { distanceMeters, formatDistance } from '../utils/geo';

const RADIUS_OPTIONS = [150, 250, 500, 1000];
const ZONE_COLORS = ['#00D2B4', '#38BDF8', '#FFB020', '#A78BFA'];

export function ZonesScreen() {
  const insets = useSafeAreaInsets();
  const { zones, selfMember, addZone, updateZoneRadius, toggleZoneAlert, removeZone } = useOrbit();
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
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>GEOFENCE ZONES</Text>
          <Text style={styles.title}>Smart Perimeter Alerts</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={20} color={Colors.textInverse} />
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
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneTop}>
                <View style={[styles.iconWrap, { backgroundColor: `${zone.color}22` }]}>
                  <Ionicons name={renderZoneIcon(zone.icon)} size={20} color={zone.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.zoneTitleRow}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: inside
                            ? Colors.accentPrimaryDim
                            : Colors.bgElevated,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: inside ? Colors.accentPrimary : Colors.textSecondary },
                        ]}
                      >
                        {inside ? 'Inside Zone' : `${formatDistance(dist)} away`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.zoneMeta}>Radius: {zone.radiusMeters} m</Text>
                </View>

                <TouchableOpacity onPress={() => removeZone(zone.id)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.inlineRadiusRow}>
                {RADIUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => updateZoneRadius(zone.id, opt)}
                    style={[
                      styles.inlineChip,
                      zone.radiusMeters === opt && styles.inlineChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.inlineChipText,
                        zone.radiusMeters === opt && styles.inlineChipTextActive,
                      ]}
                    >
                      {opt >= 1000 ? '1 km' : `${opt}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Notify on Arrival</Text>
                <Switch
                  value={zone.notifyOnArrive}
                  onValueChange={() => toggleZoneAlert(zone.id, 'arrive')}
                  trackColor={{ false: Colors.bgElevated, true: Colors.accentPrimaryDim }}
                  thumbColor={zone.notifyOnArrive ? Colors.accentPrimary : Colors.textMuted}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Notify on Departure</Text>
                <Switch
                  value={zone.notifyOnLeave}
                  onValueChange={() => toggleZoneAlert(zone.id, 'leave')}
                  trackColor={{ false: Colors.bgElevated, true: Colors.accentPrimaryDim }}
                  thumbColor={zone.notifyOnLeave ? Colors.accentPrimary : Colors.textMuted}
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
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pin New Zone at Current Location</Text>
            <TextInput
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="Zone name (e.g. Gym, Library)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Perimeter Radius</Text>
            <View style={styles.chipRow}>
              {RADIUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setRadius(opt)}
                  style={[styles.chip, radius === opt && styles.chipActive]}
                >
                  <Text style={[styles.chipText, radius === opt && styles.chipTextActive]}>
                    {opt >= 1000 ? '1 km' : `${opt} m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Ring Color</Text>
            <View style={styles.chipRow}>
              {ZONE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    color === c && styles.colorSwatchActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateZone} style={styles.saveBtn}>
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
    backgroundColor: Colors.bgPrimary,
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
    color: Colors.accentPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  scrollContent: {
    gap: 12,
  },
  zoneCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  inlineChipActive: {
    backgroundColor: Colors.accentPrimaryDim,
    borderColor: Colors.accentPrimary,
  },
  inlineChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  inlineChipTextActive: {
    color: Colors.accentPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,9,11,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: Colors.accentPrimaryDim,
    borderColor: Colors.accentPrimary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.accentPrimary,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
});
