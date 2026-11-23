import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingModal } from '../components/OnboardingModal';
import { useOrbit } from '../context/OrbitContext';
import { Colors, Radii, Spacing } from '../theme/tokens';
import { FeedEventType } from '../types/orbit';
import { formatTimeAgo } from '../utils/geo';

const QUICK_STATUSES = ['On my way', 'Arrived safely', 'Need pickup', 'Low battery'];

export function HubScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    feed,
    contacts,
    sendCheckIn,
    addEmergencyContact,
    removeEmergencyContact,
    resetDemoData,
  } = useOrbit();

  const [note, setNote] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handlePostNote = () => {
    sendCheckIn(note);
    setNote('');
  };

  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    addEmergencyContact({
      name: contactName.trim(),
      relation: 'Emergency Contact',
      phone: contactPhone.trim(),
    });
    setContactName('');
    setContactPhone('');
    setShowAddContact(false);
  };

  const eventMeta = (type: FeedEventType) => {
    switch (type) {
      case 'sos':
        return { icon: 'warning' as const, color: Colors.accentCrimson };
      case 'zone_arrive':
        return { icon: 'enter-outline' as const, color: Colors.accentPrimary };
      case 'zone_leave':
        return { icon: 'exit-outline' as const, color: Colors.accentAmber };
      case 'ping':
        return { icon: 'flash-outline' as const, color: Colors.accentSecondary };
      default:
        return { icon: 'radio-outline' as const, color: Colors.accentPrimary };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>ORBIT HUB</Text>
          <Text style={styles.title}>Check-Ins & Contacts</Text>
        </View>
        <TouchableOpacity onPress={() => setProfileOpen(true)} style={styles.profilePill}>
          <View style={[styles.profileDot, { backgroundColor: profile.avatarColor }]} />
          <Text style={styles.profileText}>{profile.name}</Text>
          <Ionicons name="settings-outline" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Check-In Composer */}
        <View style={styles.composerCard}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Share a quick status with your Orbit..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
          <TouchableOpacity onPress={handlePostNote} style={styles.sendBtn}>
            <Ionicons name="send" size={16} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => sendCheckIn(status)}
              style={styles.quickChip}
            >
              <Text style={styles.quickChipText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity Timeline */}
        <Text style={styles.sectionTitle}>Live Orbit Timeline</Text>
        <View style={styles.timelineList}>
          {feed.map((item) => {
            const meta = eventMeta(item.type);
            return (
              <View key={item.id} style={styles.feedCard}>
                <View style={[styles.feedIcon, { backgroundColor: `${meta.color}20` }]}>
                  <Ionicons name={meta.icon} size={17} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.feedHeader}>
                    <Text style={styles.feedMember}>{item.memberName}</Text>
                    <Text style={styles.feedTime}>{formatTimeAgo(item.timestamp)}</Text>
                  </View>
                  <Text style={styles.feedMsg}>{item.message}</Text>
                  {item.locationLabel && (
                    <Text style={styles.feedLoc}>{item.locationLabel}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={() => setShowAddContact((v) => !v)}>
            <Text style={styles.addLink}>{showAddContact ? 'Close' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>

        {showAddContact && (
          <View style={styles.addContactBox}>
            <TextInput
              value={contactName}
              onChangeText={setContactName}
              placeholder="Contact Name"
              placeholderTextColor={Colors.textMuted}
              style={styles.contactInput}
            />
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="Phone Number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              style={styles.contactInput}
            />
            <TouchableOpacity onPress={handleAddContact} style={styles.saveContactBtn}>
              <Text style={styles.saveContactText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.timelineList}>
          {contacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Ionicons name="call-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactMeta}>
                  {c.relation} • {c.phone}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeEmergencyContact(c.id)}>
                <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={resetDemoData} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.resetText}>Reset Demo Data</Text>
        </TouchableOpacity>
      </ScrollView>

      <OnboardingModal visible={profileOpen} onClose={() => setProfileOpen(false)} />
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  profileDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  profileText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickRow: {
    gap: 8,
  },
  quickChip: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
  resetBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSecondary,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scrollContent: {
    gap: 14,
  },
  composerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  timelineList: {
    gap: 10,
  },
  feedCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 12,
  },
  feedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedMember: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  feedTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  feedMsg: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  feedLoc: {
    fontSize: 11,
    color: Colors.accentPrimary,
    marginTop: 4,
    fontWeight: '600',
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  addLink: {
    color: Colors.accentPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  addContactBox: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    padding: 12,
    gap: 10,
  },
  contactInput: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  saveContactBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveContactText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 13,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 12,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentPrimaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  contactMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
