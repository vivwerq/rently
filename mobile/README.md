# Rently Mobile Application (Android-First React Native)

This directory contains the mobile client application for **Rently**, targeting Android 14+ (API 34) and cross-platform architecture.

## Key Mobile Features & Architecture
1. **5-Tab Navigation**: `Explore`, `Post`, `Activity`, `Messages`, `Profile`.
2. **Zoomcar-Parity Search & Discovery**: [MobileSearchScreen.tsx](file:///home/xc0mrade/Rently/mobile/src/features/search/MobileSearchScreen.tsx) with sticky search capsule, campus quick filter pills, and KM packages (`250 km` / `400 km`).
3. **Offline-Resilient Handover & Inspection**: [GuidedInspectionCamera.tsx](file:///home/xc0mrade/Rently/mobile/src/features/inspection/GuidedInspectionCamera.tsx) with on-device reticle silhouettes, GPS coordinates, and timestamp watermarking burned into image buffers before upload.
4. **Student Access Pass**: [StudentPassScreen.tsx](file:///home/xc0mrade/Rently/mobile/src/features/student/StudentPassScreen.tsx) with instant `.edu.in` roll verification, 50% deposit waivers, and campus gate delivery routing.
5. **Campus Safe Handover**: Geofenced safe pickup spots at university gates (CU Gharuan, PU Chandigarh, CGC Landran, PEC, Plaksha, IISER).
6. **Secret Handover OTP Handshake**: Secure cryptographic OTP verification preventing unauthorized car drive-offs or disputed item collections.
7. **Masked Chat**: Buyer-seller communication with automated anti-fraud regex and phone number masking.

## Local Development & Android Build Setup

### Prerequisites
- Node.js v20+
- JDK 17
- Android Studio with Android SDK Platform 34 (Android 14) and Android Build-Tools 34.0.0
- Android Virtual Device (AVD) or physical device connected via USB with USB Debugging enabled

### Quick Start
```bash
# 1. Install dependencies
cd mobile
npm install

# 2. Start Metro bundler
npm start

# 3. In another terminal, launch Android debug build
npm run android
```

### Google Play Store Release Preparation
- **Package Name**: `com.rently.hyperlocal`
- **Permissions**: `CAMERA` (for vehicle/goods handover verification), `ACCESS_FINE_LOCATION` (foreground only, for nearby campus listings and watermarking), `READ_MEDIA_IMAGES`.
- **Payment Compliance**: Follows Google Play's physical goods and rentals exemption. All transactions are routed through Razorpay Route for split vendor settlement.
- **Account Deletion**: Full self-service account deletion available directly under Profile tab, compliant with Google Play Data Safety requirements.
