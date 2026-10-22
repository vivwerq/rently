import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, ScrollView } from 'react-native';

export const StudentPassScreen: React.FC<{ onVerified?: () => void }> = ({ onVerified }) => {
  const [university, setUniversity] = useState('Chandigarh University (CU), Gharuan');
  const [studentId, setStudentId] = useState('');
  const [eduEmail, setEduEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (!studentId || !eduEmail) {
      Alert.alert('Incomplete Details', 'Please enter your Student ID roll number and university email address.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      onVerified?.();
      Alert.alert('Student Pass Activated!', 'You have unlocked 50% off rental deposits and priority campus gate drop-offs.');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgeBanner}>
          <Text style={styles.badgeIcon}>🎓</Text>
          <Text style={styles.bannerTitle}>Tri-City Student Access Pass</Text>
          <Text style={styles.bannerSubtitle}>
            Special rates & zero hassle for CU Gharuan, PU Chandigarh, CGC Landran, and PEC students.
          </Text>
        </View>

        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>⚡ UNLOCKED PRIVILEGES</Text>
          <View style={styles.perkItem}>
            <Text style={styles.perkBullet}>✓</Text>
            <Text style={styles.perkText}><Text style={styles.bold}>50% Escrow Deposit Discount</Text> on all cars and room coolers</Text>
          </View>
          <View style={styles.perkItem}>
            <Text style={styles.perkBullet}>✓</Text>
            <Text style={styles.perkText}><Text style={styles.bold}>Free Campus Safe Gate Delivery</Text> at main security gates</Text>
          </View>
          <View style={styles.perkItem}>
            <Text style={styles.perkBullet}>✓</Text>
            <Text style={styles.perkText}><Text style={styles.bold}>Peer-to-Peer Semester Buy & Sell</Text> with 0% commission</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Select Your Campus</Text>
          <TextInput
            style={styles.input}
            value={university}
            onChangeText={setUniversity}
            placeholder="Select University"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.inputLabel}>University Roll / Registration Number</Text>
          <TextInput
            style={styles.input}
            value={studentId}
            onChangeText={setStudentId}
            placeholder="e.g. 21BCS10842"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.inputLabel}>Official Student Email (.edu.in or .ac.in)</Text>
          <TextInput
            style={styles.input}
            value={eduEmail}
            onChangeText={setEduEmail}
            placeholder="e.g. rahul.sharma@cumail.in"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.verifyBtn, verified && styles.verifiedBtn]}
            onPress={handleVerify}
            disabled={isVerifying || verified}
          >
            <Text style={styles.verifyBtnText}>
              {isVerifying ? 'Verifying Student ID...' : verified ? '✓ Student Pass Active (Verified)' : 'Claim Student Perks Instantly'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, gap: 16 },
  badgeBanner: {
    backgroundColor: '#064e3b',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  badgeIcon: { fontSize: 36, marginBottom: 8 },
  bannerTitle: { color: '#ecfdf5', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  bannerSubtitle: { color: '#a7f3d0', fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  perksCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  perksTitle: { color: '#fbbf24', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 12 },
  perkItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  perkBullet: { color: '#10b981', fontWeight: '800', fontSize: 14 },
  perkText: { color: '#cbd5e1', fontSize: 12, flex: 1, lineHeight: 18 },
  bold: { color: '#f8fafc', fontWeight: '700' },
  formCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 13,
  },
  verifyBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  verifiedBtn: { backgroundColor: '#059669' },
  verifyBtnText: { color: '#064e3b', fontWeight: '800', fontSize: 14 },
});
