import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrbit } from '../context/OrbitContext';
import { Colors, Radii, Spacing } from '../theme/tokens';

interface CircleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CircleModal({ visible, onClose }: CircleModalProps) {
  const { circles, activeCircle, switchCircle, createCircle, joinCircleByCode } = useOrbit();
  const [newName, setNewName] = useState('');
  const [inviteInput, setInviteInput] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCircle(newName);
    setNewName('');
    onClose();
  };

  const handleJoin = () => {
    const ok = joinCircleByCode(inviteInput);
    if (!ok) {
      Alert.alert('Invalid Code', 'Enter at least a 4-character Orbit invite code.');
      return;
    }
    setInviteInput('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Your Orbits</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inviteBox}>
            <Text style={styles.inviteLabel}>ACTIVE INVITE CODE</Text>
            <Text style={styles.inviteCode}>{activeCircle.inviteCode}</Text>
            <Text style={styles.inviteHint}>
              Share this code with family or crew to join {activeCircle.name}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Share.share({
                  message: `Join my "${activeCircle.name}" Orbit on KinOrbit! Invite code: ${activeCircle.inviteCode}`,
                }).catch(() => {})
              }
              style={styles.shareCodeBtn}
            >
              <Ionicons name="share-social-outline" size={14} color={Colors.accentPrimary} />
              <Text style={styles.shareCodeText}>Share Invite</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.circleList}>
            {circles.map((c) => {
              const selected = c.id === activeCircle.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    switchCircle(c.id);
                    onClose();
                  }}
                  style={[styles.circleItem, selected && styles.circleItemActive]}
                >
                  <View style={[styles.dot, { backgroundColor: c.accentColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.circleItemName}>{c.name}</Text>
                    <Text style={styles.circleItemMeta}>
                      {c.memberIds.length} members • Code {c.inviteCode}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Create New Orbit</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Weekend Hiking"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleCreate} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Join with Invite Code</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={inviteInput}
              onChangeText={setInviteInput}
              placeholder="Enter 6-char code"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleJoin} style={styles.actionBtnSecondary}>
              <Text style={styles.actionBtnSecText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 11, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.lg,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    backgroundColor: Colors.bgElevated,
    padding: 8,
    borderRadius: Radii.pill,
  },
  inviteBox: {
    backgroundColor: Colors.accentPrimaryDim,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.md,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  inviteLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.accentPrimary,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    color: Colors.textPrimary,
  },
  inviteHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shareCodeBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  shareCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
  circleList: {
    gap: 8,
  },
  circleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgElevated,
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  circleItemActive: {
    borderColor: Colors.accentPrimary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  circleItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  circleItemMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.sm,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  actionBtnText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 13,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.sm,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  actionBtnSecText: {
    color: Colors.accentPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
});
