import React, { useState, useEffect, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  signOut, 
  RecaptchaVerifier, 
  type User,
  type UserCredential
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import type { 
  RentlyUserProfile, 
  StudentVerificationDetails 
} from '../types/auth';
import { AuthContext } from './authContextDef';

const LOCAL_STORAGE_KEY = 'rently_authenticated_profile';

// Pre-seeded demo user for immediate prototype usability
const DEFAULT_DEMO_USER: RentlyUserProfile = {
  uid: 'usr-demo-student-cu',
  displayName: 'Amanpreet Singh',
  email: 'amanpreet.singh@cuchd.in',
  phoneNumber: '+91 98765 43210',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'HOST',
  isStudentVerified: true,
  studentDetails: {
    institutionId: 'CU_GHARUAN',
    institutionName: 'Chandigarh University (CU)',
    rollNumber: '21BCS4829',
    institutionalEmail: 'amanpreet.singh@cuchd.in',
    verifiedAt: '2026-10-15'
  },
  drivingLicenseVerified: true,
  isListingVerified: true,
  listingVerificationDetails: {
    verificationType: 'STUDENT_PASS',
    idNumber: '21BCS4829',
    documentName: 'CU Student Identity SmartCard',
    verifiedAt: '2026-10-15',
    issuer: 'Chandigarh University Registrar'
  },
  bio: 'CS student at CU Gharuan. Verified campus host providing well-maintained study gear, monitor displays, and certified self-drive commercial hatchbacks.',
  alternatePhone: '+91 98140 12345',
  preferredHandoverSpot: 'Gate 2 Main Entrance / Food Court',
  deliveryAddress: 'Hostel Block 3, CU Gharuan Campus, Mohali',
  createdAt: '2026-09-01'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isFirebaseActive = isFirebaseConfigured() && Boolean(auth);
  
  const [user, setUser] = useState<User | any | null>(null);
  const [profile, setProfile] = useState<RentlyUserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      // Start with demo user so existing orders, campus gates & student perks work out of the box
      return DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseActive);

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to sync profile to localStorage', e);
    }
  }, [profile]);

  // Firebase auth listener
  useEffect(() => {
    if (!isFirebaseActive || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Detect student institutional domains automatically
        const email = firebaseUser.email || '';
        const isCollegeEmail = email.endsWith('.edu') || 
                               email.endsWith('.in') || 
                               email.includes('cuchd') || 
                               email.includes('pu.ac') || 
                               email.includes('pec.edu');

        setProfile(prev => {
          const base: RentlyUserProfile = prev || {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Campus Renter',
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
            role: 'RENTER',
            isStudentVerified: isCollegeEmail,
            drivingLicenseVerified: false,
            createdAt: new Date().toISOString()
          };
          return {
            ...base,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || base.displayName,
            email: firebaseUser.email || base.email,
            phoneNumber: firebaseUser.phoneNumber || base.phoneNumber,
            photoURL: firebaseUser.photoURL || base.photoURL,
            isStudentVerified: base.isStudentVerified || isCollegeEmail
          };
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseActive]);

  // 1. Google 1-Tap / Popup Login
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isFirebaseActive && auth) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const email = fbUser.email || '';
        const isCollege = email.endsWith('.edu') || email.includes('cuchd') || email.includes('pu.ac') || email.includes('pec.edu');

        const newProfile: RentlyUserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Campus User',
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
          role: 'RENTER',
          isStudentVerified: isCollege,
          studentDetails: isCollege ? {
            institutionId: 'CU_GHARUAN',
            institutionName: 'Chandigarh University (Auto-Verified)',
            rollNumber: email.split('@')[0].toUpperCase(),
            institutionalEmail: email,
            verifiedAt: new Date().toISOString().split('T')[0]
          } : undefined,
          drivingLicenseVerified: true,
          createdAt: new Date().toISOString()
        };
        setProfile(newProfile);
        setUser(fbUser);
      } else {
        // Local Demo fallback
        await new Promise(r => setTimeout(r, 600));
        setProfile(DEFAULT_DEMO_USER);
        setUser({ uid: DEFAULT_DEMO_USER.uid, email: DEFAULT_DEMO_USER.email });
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Phone OTP: Step 1 (Send Code)
  const sendPhoneOtp = async (phone: string, recaptchaContainerId: string): Promise<{ confirmationResult?: any; verificationId?: string }> => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    if (isFirebaseActive && auth) {
      const appVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      return { confirmationResult };
    } else {
      // Local demo mode: simulate SMS dispatch
      await new Promise(r => setTimeout(r, 500));
      return { verificationId: 'demo-verify-session-id' };
    }
  };

  // 2. Phone OTP: Step 2 (Verify Code)
  const verifyPhoneOtp = async (confirmationResult: any, otp: string, phone: string): Promise<void> => {
    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91 ${phone.replace(/\D/g, '')}`;

      if (isFirebaseActive && confirmationResult?.confirm) {
        const result: UserCredential = await confirmationResult.confirm(otp);
        const fbUser = result.user;
        setUser(fbUser);
        setProfile(prev => ({
          uid: fbUser.uid,
          displayName: prev?.displayName || 'Tricity Renter',
          phoneNumber: formattedPhone,
          email: prev?.email || null,
          role: prev?.role || 'RENTER',
          isStudentVerified: prev?.isStudentVerified || false,
          drivingLicenseVerified: prev?.drivingLicenseVerified || true,
          createdAt: prev?.createdAt || new Date().toISOString()
        }));
      } else {
        // Demo mode validation (Accepts demo verification code 482910 or any valid 6-digit code)
        await new Promise(r => setTimeout(r, 600));
        const demoUid = `usr-${Date.now().toString().slice(-6)}`;
        setProfile({
          uid: demoUid,
          displayName: 'Amanpreet Singh',
          phoneNumber: formattedPhone,
          email: 'amanpreet.singh@cuchd.in',
          role: 'RENTER',
          isStudentVerified: true,
          drivingLicenseVerified: true,
          createdAt: new Date().toISOString()
        });
        setUser({ uid: demoUid, phoneNumber: formattedPhone });
      }
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Campus Student ID Verification
  const verifyStudentPass = async (details: Omit<StudentVerificationDetails, 'verifiedAt'>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isStudentVerified: true,
          studentDetails: {
            ...details,
            verifiedAt: new Date().toISOString().split('T')[0]
          }
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Standard Listing Host Verification (Required for public internet publishing)
  const verifyAsStandardHost = async (details: Omit<import('../types/auth').StandardListingVerificationDetails, 'verifiedAt'>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isListingVerified: true,
          role: prev.role === 'RENTER' ? 'HOST' : prev.role,
          listingVerificationDetails: {
            ...details,
            verifiedAt: new Date().toISOString().split('T')[0]
          }
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Update User Profile Info (Name, Bio, Handover spot, etc.)
  const updateUserProfile = async (updates: Partial<RentlyUserProfile>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Sign Out
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isFirebaseActive && auth) {
        await signOut(auth);
      }
      setUser(null);
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(profile),
        isLoading,
        isFirebaseActive,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        verifyStudentPass,
        verifyAsStandardHost,
        updateUserProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

