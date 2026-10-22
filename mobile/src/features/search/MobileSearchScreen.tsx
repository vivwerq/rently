import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';

interface VehicleItem {
  id: string;
  name: string;
  transmission: string;
  fuel: string;
  seats: number;
  rating: number;
  tripsCount: number;
  pricePerHour: number;
  pricePerDay: number;
  primaryImage: string;
  operatorVerified: boolean;
  campusEligible: boolean;
}

const SAMPLE_VEHICLES: VehicleItem[] = [
  {
    id: 'veh-1',
    name: 'Mahindra Thar 4x4 Hardtop',
    transmission: 'Manual',
    fuel: 'Diesel',
    seats: 4,
    rating: 4.96,
    tripsCount: 42,
    pricePerHour: 220,
    pricePerDay: 3500,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    operatorVerified: true,
    campusEligible: true,
  },
  {
    id: 'veh-2',
    name: 'Hyundai Creta SX (O) Sunroof',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.88,
    tripsCount: 68,
    pricePerHour: 180,
    pricePerDay: 2800,
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    operatorVerified: true,
    campusEligible: true,
  },
  {
    id: 'veh-3',
    name: 'Maruti Suzuki Swift VXi',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.82,
    tripsCount: 94,
    pricePerHour: 110,
    pricePerDay: 1650,
    primaryImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80',
    operatorVerified: true,
    campusEligible: true,
  }
];

export const MobileSearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedCampus, setSelectedCampus] = useState('All');
  const [selectedKmPackage, setSelectedKmPackage] = useState<'250' | '400'>('250');

  const campuses = ['All', 'CU Gharuan', 'PU Chd', 'CGC Landran', 'PEC Sector 12'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Zoomcar-Inspired Sticky Search Capsule Header */}
      <View style={styles.header}>
        <View style={styles.capsule}>
          <TouchableOpacity style={styles.capsuleSection} activeOpacity={0.8}>
            <Text style={styles.capsuleLabel}>PICKUP LOCATION</Text>
            <Text style={styles.capsuleValue} numberOfLines={1}>
              {selectedCampus === 'All' ? 'Mohali / Chandigarh / Kharar' : selectedCampus}
            </Text>
          </TouchableOpacity>
          <View style={styles.capsuleDivider} />
          <TouchableOpacity style={styles.capsuleSection} activeOpacity={0.8}>
            <Text style={styles.capsuleLabel}>TRIP DATES</Text>
            <Text style={styles.capsuleValue} numberOfLines={1}>Today, 18:00 - Tomorrow, 20:00</Text>
          </TouchableOpacity>
        </View>

        {/* Campus Quick Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={campuses}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.pillsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, selectedCampus === item && styles.activePill]}
              onPress={() => setSelectedCampus(item)}
            >
              <Text style={[styles.pillText, selectedCampus === item && styles.activePillText]}>
                {item === 'All' ? '📍 All Tri-City' : `🎓 ${item}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* KM Package Switcher */}
      <View style={styles.kmBanner}>
        <Text style={styles.kmBannerTitle}>Choose KM Package:</Text>
        <View style={styles.kmToggle}>
          <TouchableOpacity
            style={[styles.kmBtn, selectedKmPackage === '250' && styles.kmBtnActive]}
            onPress={() => setSelectedKmPackage('250')}
          >
            <Text style={[styles.kmBtnText, selectedKmPackage === '250' && styles.kmBtnTextActive]}>
              250 KM Included
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.kmBtn, selectedKmPackage === '400' && styles.kmBtnActive]}
            onPress={() => setSelectedKmPackage('400')}
          >
            <Text style={[styles.kmBtnText, selectedKmPackage === '400' && styles.kmBtnTextActive]}>
              400 KM (Hill Trips)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vehicle Listing Feed */}
      <FlatList
        data={SAMPLE_VEHICLES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.carCard}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.primaryImage }} style={styles.carImage} resizeMode="cover" />
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.badgeText}>✓ Yellow Plate RTO Verified</Text>
                </View>
                {item.campusEligible && (
                  <View style={styles.studentBadge}>
                    <Text style={styles.studentBadgeText}>🎓 Campus Gate Delivery</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.carDetails}>
              <View style={styles.titleRow}>
                <Text style={styles.carName}>{item.name}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {item.rating.toFixed(2)}</Text>
                  <Text style={styles.tripsText}>({item.tripsCount})</Text>
                </View>
              </View>

              <Text style={styles.specsText}>
                {item.transmission} • {item.fuel} • {item.seats} Seats • Unlimited Sanitized
              </Text>

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.pricePerHr}>₹{item.pricePerHour}<Text style={styles.perUnit}>/hr</Text></Text>
                  <Text style={styles.pricePerDay}>₹{item.pricePerDay} / day (All-in Transparent)</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => navigation?.navigate?.('CarQuote', { vehicle: item })}
                >
                  <Text style={styles.bookBtnText}>Instant Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#064e3b', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  capsule: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  capsuleSection: { flex: 1, justifyContent: 'center' },
  capsuleLabel: { fontSize: 9, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  capsuleValue: { fontSize: 12, fontWeight: '700', color: '#0f172a', marginTop: 1 },
  capsuleDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 },
  pillsContainer: { paddingVertical: 4, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 6,
  },
  activePill: { backgroundColor: '#10b981' },
  pillText: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  activePillText: { color: '#064e3b', fontWeight: '800' },
  kmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  kmBannerTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  kmToggle: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 8, padding: 2 },
  kmBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  kmBtnActive: { backgroundColor: '#10b981' },
  kmBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  kmBtnTextActive: { color: '#064e3b', fontWeight: '800' },
  listContent: { padding: 16, gap: 16 },
  carCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  imageContainer: { height: 180, width: '100%', position: 'relative' },
  carImage: { width: '100%', height: '100%' },
  badgeRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', gap: 6 },
  verifiedBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  studentBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  studentBadgeText: { color: '#93c5fd', fontSize: 10, fontWeight: '700' },
  carDetails: { padding: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carName: { color: '#f8fafc', fontSize: 16, fontWeight: '700', flex: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },
  tripsText: { color: '#94a3b8', fontSize: 10, marginLeft: 3 },
  specsText: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pricePerHr: { color: '#10b981', fontSize: 18, fontWeight: '800' },
  perUnit: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  pricePerDay: { color: '#64748b', fontSize: 10, marginTop: 2 },
  bookBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: { color: '#064e3b', fontWeight: '800', fontSize: 13 },
});
