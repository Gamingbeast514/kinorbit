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
import { Radii, Spacing } from '../theme/tokens';

interface CircleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CircleModal({ visible, onClose }: CircleModalProps) {
  const { circles, activeCircle, colors, switchCircle, createCircle, joinCircleByCode } =
    useOrbit();
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
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Your Orbits</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.bgElevated }]}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.inviteBox,
              { backgroundColor: colors.accentPrimaryDim, borderColor: colors.borderAccent },
            ]}
          >
            <Text style={[styles.inviteLabel, { color: colors.accentPrimary }]}>
              ACTIVE INVITE CODE
            </Text>
            <Text style={[styles.inviteCode, { color: colors.textPrimary }]}>
              {activeCircle.inviteCode}
            </Text>
            <Text style={[styles.inviteHint, { color: colors.textSecondary }]}>
              Share this code with family or crew to join {activeCircle.name}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Share.share({
                  message: `Join my "${activeCircle.name}" Orbit on KinOrbit! Invite code: ${activeCircle.inviteCode}`,
                }).catch(() => {})
              }
              style={[
                styles.shareCodeBtn,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderAccent },
              ]}
            >
              <Ionicons name="share-social-outline" size={14} color={colors.accentPrimary} />
              <Text style={[styles.shareCodeText, { color: colors.accentPrimary }]}>
                Share Invite
              </Text>
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
                  style={[
                    styles.circleItem,
                    {
                      backgroundColor: colors.bgElevated,
                      borderColor: selected ? colors.accentPrimary : colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: c.accentColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.circleItemName, { color: colors.textPrimary }]}>
                      {c.name}
                    </Text>
                    <Text style={[styles.circleItemMeta, { color: colors.textSecondary }]}>
                      {c.memberIds.length} members • Code {c.inviteCode}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Create New Orbit</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Weekend Hiking"
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
            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]}
            >
              <Text style={styles.actionBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Join with Invite Code
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={inviteInput}
              onChangeText={setInviteInput}
              placeholder="Enter 6-char code"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgPrimary,
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleJoin}
              style={[
                styles.actionBtnSecondary,
                { backgroundColor: colors.bgElevated, borderColor: colors.borderAccent },
              ]}
            >
              <Text style={[styles.actionBtnSecText, { color: colors.accentPrimary }]}>Join</Text>
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
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    borderWidth: 1,
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
  },
  closeBtn: {
    padding: 8,
    borderRadius: Radii.pill,
  },
  inviteBox: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  inviteLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  inviteHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  shareCodeBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  shareCodeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  circleList: {
    gap: 8,
  },
  circleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  circleItemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  circleItemMeta: {
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  actionBtn: {
    borderRadius: Radii.sm,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  actionBtnSecondary: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  actionBtnSecText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
