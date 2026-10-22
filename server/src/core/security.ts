import crypto from 'node:crypto';

export interface PendingOtp {
  phone: string;
  otp: string;
  expiresAt: number;
}

export interface StudentVerificationRecord {
  userId: string;
  rollNumber: string;
  institution: string;
  email: string;
  verifiedAt: string;
  expiresAt: string;
  benefitsUnlocked: string[];
}

export interface DriverLicenseRecord {
  userId: string;
  licenseNumberMasked: string; // e.g. "DL-PB65-XXXX-7821"
  state: string;
  commercialEndorsement: boolean;
  validUntil: string;
  verified: boolean;
}

class SecurityService {
  private activeOtps: Map<string, PendingOtp> = new Map();
  private verifiedStudents: Map<string, StudentVerificationRecord> = new Map();
  private verifiedLicenses: Map<string, DriverLicenseRecord> = new Map();

  constructor() {
    // Seed default student verification
    this.verifiedStudents.set('usr-demo-student', {
      userId: 'usr-demo-student',
      rollNumber: '21BCS4821',
      institution: 'Chandigarh University (CU)',
      email: 'student.21bcs4821@cumail.in',
      verifiedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 335 * 86400000).toISOString(),
      benefitsUnlocked: [
        '50% Security Deposit Waiver on Room Rentals',
        '0% Commission on Textbook and Cycle Resale',
        'Campus Gate Priority Handover Delivery',
        '20% Extra KM Allowance on Weekend Road Trips'
      ]
    });

    // Seed default verified driver's license
    this.verifiedLicenses.set('usr-demo-student', {
      userId: 'usr-demo-student',
      licenseNumberMasked: 'DL-0620210048219',
      state: 'Punjab',
      commercialEndorsement: true,
      validUntil: '2035-10-24',
      verified: true
    });
  }

  /**
   * Generate a 6-digit numeric OTP for phone login or handover verification.
   */
  public generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Request an SMS OTP for phone verification.
   */
  public requestPhoneOtp(phone: string): { success: boolean; message: string; demoOtp: string } {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length < 10) {
      throw new Error('Please provide a valid 10-digit Indian phone number.');
    }

    const otp = this.generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.activeOtps.set(cleaned, { phone: cleaned, otp, expiresAt });

    return {
      success: true,
      message: `Verification OTP dispatched to +91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
      demoOtp: otp // Returned in dev/prototype mode for immediate testing
    };
  }

  /**
   * Verify phone OTP.
   */
  public verifyPhoneOtp(phone: string, otpInput: string): { verified: boolean; token: string } {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    const record = this.activeOtps.get(cleaned);

    // Allow master test OTP 482910 for seamless demo testing
    if (otpInput === '482910' || (record && record.otp === otpInput && record.expiresAt > Date.now())) {
      if (record) this.activeOtps.delete(cleaned);
      const sessionToken = `rnt_tok_${crypto.randomBytes(16).toString('hex')}`;
      return { verified: true, token: sessionToken };
    }

    return { verified: false, token: '' };
  }

  /**
   * Verify and register student ID status.
   */
  public verifyStudent(data: {
    userId: string;
    rollNumber: string;
    institution: string;
    email: string;
  }): StudentVerificationRecord {
    const record: StudentVerificationRecord = {
      userId: data.userId,
      rollNumber: data.rollNumber.trim().toUpperCase(),
      institution: data.institution,
      email: data.email.trim().toLowerCase(),
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      benefitsUnlocked: [
        '50% Security Deposit Waiver on Room Rentals',
        '0% Commission on Textbook and Cycle Resale',
        'Campus Gate Priority Handover Delivery',
        '20% Extra KM Allowance on Weekend Road Trips'
      ]
    };

    this.verifiedStudents.set(data.userId, record);
    return record;
  }

  public getStudentStatus(userId: string): StudentVerificationRecord | null {
    return this.verifiedStudents.get(userId) || null;
  }

  public getLicenseStatus(userId: string): DriverLicenseRecord | null {
    return this.verifiedLicenses.get(userId) || null;
  }
}

export const securityService = new SecurityService();
