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
import { Radii, Spacing } from '../theme/tokens';
import { FeedEventType } from '../types/orbit';
import { formatTimeAgo } from '../utils/geo';

const QUICK_STATUSES = ['On my way', 'Arrived safely', 'Need pickup', 'Low battery'];

export function HubScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    colors,
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
        return { icon: 'warning' as const, color: colors.accentCrimson };
      case 'zone_arrive':
        return { icon: 'enter-outline' as const, color: colors.accentMint };
      case 'zone_leave':
        return { icon: 'exit-outline' as const, color: colors.accentAmber };
      case 'ping':
        return { icon: 'flash-outline' as const, color: colors.accentViolet };
      default:
        return { icon: 'radio-outline' as const, color: colors.accentPrimary };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: colors.bgPrimary }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accentPrimary }]}>ORBIT HUB</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Check-Ins & Contacts</Text>
        </View>
        <TouchableOpacity
          onPress={() => setProfileOpen(true)}
          style={[
            styles.profilePill,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={[styles.profileDot, { backgroundColor: profile.avatarColor }]} />
          <Text style={[styles.profileText, { color: colors.textPrimary }]}>{profile.name}</Text>
          <Ionicons name="settings-outline" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.composerCard,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
          ]}
        >
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Share a quick status with your Orbit..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.textPrimary }]}
          />
          <TouchableOpacity
            onPress={handlePostNote}
            style={[styles.sendBtn, { backgroundColor: colors.accentPrimary }]}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => sendCheckIn(status)}
              style={[
                styles.quickChip,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderAccent },
              ]}
            >
              <Text style={[styles.quickChipText, { color: colors.accentPrimary }]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Live Orbit Timeline</Text>
        <View style={styles.timelineList}>
          {feed.map((item) => {
            const meta = eventMeta(item.type);
            return (
              <View
                key={item.id}
                style={[
                  styles.feedCard,
                  { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
                ]}
              >
                <View style={[styles.feedIcon, { backgroundColor: `${meta.color}20` }]}>
                  <Ionicons name={meta.icon} size={17} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.feedHeader}>
                    <Text style={[styles.feedMember, { color: colors.textPrimary }]}>
                      {item.memberName}
                    </Text>
                    <Text style={[styles.feedTime, { color: colors.textMuted }]}>
                      {formatTimeAgo(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.feedMsg, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>
                  {item.locationLabel && (
                    <Text style={[styles.feedLoc, { color: colors.accentPrimary }]}>
                      {item.locationLabel}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.contactsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Emergency Contacts
          </Text>
          <TouchableOpacity onPress={() => setShowAddContact((v) => !v)}>
            <Text style={[styles.addLink, { color: colors.accentPrimary }]}>
              {showAddContact ? 'Close' : '+ Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddContact && (
          <View
            style={[
              styles.addContactBox,
              { backgroundColor: colors.bgSecondary, borderColor: colors.borderAccent },
            ]}
          >
            <TextInput
              value={contactName}
              onChangeText={setContactName}
              placeholder="Contact Name"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.contactInput,
                {
                  backgroundColor: colors.bgPrimary,
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                },
              ]}
            />
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="Phone Number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={[
                styles.contactInput,
                {
                  backgroundColor: colors.bgPrimary,
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddContact}
              style={[styles.saveContactBtn, { backgroundColor: colors.accentPrimary }]}
            >
              <Text style={styles.saveContactText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.timelineList}>
          {contacts.map((c) => (
            <View
              key={c.id}
              style={[
                styles.contactCard,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
              ]}
            >
              <View style={[styles.contactAvatar, { backgroundColor: colors.accentPrimaryDim }]}>
                <Ionicons name="call-outline" size={18} color={colors.accentPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.textPrimary }]}>{c.name}</Text>
                <Text style={[styles.contactMeta, { color: colors.textSecondary }]}>
                  {c.relation} • {c.phone}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeEmergencyContact(c.id)}>
                <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={resetDemoData}
          style={[
            styles.resetBtn,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
          ]}
        >
          <Ionicons name="refresh-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset Demo Data</Text>
        </TouchableOpacity>
      </ScrollView>

      <OnboardingModal visible={profileOpen} onClose={() => setProfileOpen(false)} />
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
    borderWidth: 1,
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
  },
  quickRow: {
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
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
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    gap: 14,
  },
  composerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  timelineList: {
    gap: 10,
  },
  feedCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
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
  },
  feedTime: {
    fontSize: 11,
  },
  feedMsg: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  feedLoc: {
    fontSize: 11,
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
    fontWeight: '800',
    fontSize: 13,
  },
  addContactBox: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  contactInput: {
    borderRadius: Radii.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  saveContactBtn: {
    borderRadius: Radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveContactText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 12,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
