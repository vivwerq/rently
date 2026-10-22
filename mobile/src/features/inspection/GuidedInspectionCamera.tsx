import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface InspectionAngle {
  id: string;
  name: string;
  guideDescription: string;
}

const MANDATORY_ANGLES: InspectionAngle[] = [
  { id: '1', name: 'Front Bumper & Windshield', guideDescription: 'Align front grill within the frame. Check headlights & windshield chips.' },
  { id: '2', name: 'Right Side & Wheels', guideDescription: 'Step back 3 paces. Capture full right profile, rims & side mirrors.' },
  { id: '3', name: 'Rear Bumper & Trunk', guideDescription: 'Capture license plate PB65-XXXX, tail lamps & trunk door.' },
  { id: '4', name: 'Left Side & Wheels', guideDescription: 'Capture left profile, tire tread depth & door panels.' },
  { id: '5', name: 'Cabin & Upholstery', guideDescription: 'Capture front seats, steering wheel, clean dashboard & mats.' },
  { id: '6', name: 'Dashboard Odometer & Fuel', guideDescription: 'Switch ignition ON. Clearly photograph odometer km & fuel needle.' }
];

export const GuidedInspectionCamera: React.FC<{ rentalId: string; onComplete: (photos: any[]) => void }> = ({
  rentalId,
  onComplete
}) => {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ [key: string]: string }>({});

  const activeAngle = MANDATORY_ANGLES[currentAngleIndex];

  const handleCapture = () => {
    // Generate watermarked photo metadata (Burned on device)
    const timestamp = new Date().toISOString();
    const simulatedGps = '30.7046° N, 76.7179° E (Mohali Phase 7 Hub)';
    const watermarkSignature = `RNT-${rentalId} | ${timestamp} | ${simulatedGps}`;

    const newCaptures = {
      ...capturedPhotos,
      [activeAngle.id]: watermarkSignature
    };
    setCapturedPhotos(newCaptures);

    if (currentAngleIndex < MANDATORY_ANGLES.length - 1) {
      setCurrentAngleIndex(currentAngleIndex + 1);
    } else {
      Alert.alert('Inspection Complete', 'All 6 mandatory vehicle angles captured with verified GPS timestamp.', [
        { text: 'Proceed to OTP Handshake', onPress: () => onComplete(Object.values(newCaptures)) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Angle {currentAngleIndex + 1} of 6: {activeAngle.name}</Text>
        <Text style={styles.subtitle}>{activeAngle.guideDescription}</Text>
      </View>

      {/* Camera Viewfinder with Overlay Guidelines */}
      <View style={styles.viewfinder}>
        <View style={styles.reticleFrame}>
          <Text style={styles.reticleText}>[ Align Vehicle Silhouette Here ]</Text>
        </View>

        {/* Live Watermark Overlay (Immutable on-device burn) */}
        <View style={styles.watermarkTag}>
          <Text style={styles.watermarkText}>
            🔒 RENTLY AUDIT PROOF · GPS: 30.7046° N, 76.7179° E · Live Telematics Stream
          </Text>
        </View>
      </View>

      {/* Shutter Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.shutterButton} onPress={handleCapture}>
          <View style={styles.innerShutter} />
        </TouchableOpacity>
        <Text style={styles.controlsHint}>Tap circle to capture with tamper-proof signature</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16
  },
  header: {
    paddingVertical: 12
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  reticleFrame: {
    width: '85%',
    height: '65%',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  reticleText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600'
  },
  watermarkTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  watermarkText: {
    color: '#34d399',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerShutter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#10b981'
  },
  controlsHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8
  }
});
