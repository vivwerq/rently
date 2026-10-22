export type UserRole = 'RENTER' | 'HOST' | 'ADMIN';

export interface StudentVerificationDetails {
  institutionId: string;
  institutionName: string;
  rollNumber: string;
  institutionalEmail?: string;
  verifiedAt: string;
}

export type ListingVerificationType = 'STUDENT_PASS' | 'GOV_ID' | 'COMMERCIAL_PERMIT' | 'SHOP_TRADE';

export interface StandardListingVerificationDetails {
  verificationType: ListingVerificationType;
  idNumber: string;
  documentName?: string;
  verifiedAt: string;
  issuer?: string;
}

export interface RentlyUserProfile {
  uid: string;
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: UserRole;
  isStudentVerified: boolean;
  studentDetails?: StudentVerificationDetails;
  drivingLicenseVerified: boolean;
  isListingVerified?: boolean;
  listingVerificationDetails?: StandardListingVerificationDetails;
  bio?: string;
  alternatePhone?: string;
  preferredHandoverSpot?: string;
  deliveryAddress?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: any | null;
  profile: RentlyUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phone: string, recaptchaContainerId: string) => Promise<{ confirmationResult?: any; verificationId?: string }>;
  verifyPhoneOtp: (confirmationResult: any, otp: string, phone: string) => Promise<void>;
  verifyStudentPass: (details: Omit<StudentVerificationDetails, 'verifiedAt'>) => Promise<void>;
  verifyAsStandardHost: (details: Omit<StandardListingVerificationDetails, 'verifiedAt'>) => Promise<void>;
  updateUserProfile: (updates: Partial<RentlyUserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

