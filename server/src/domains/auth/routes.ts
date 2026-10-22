import type { FastifyPluginAsync } from 'fastify';
import { securityService } from '../../core/security.ts';
import { parseBearerToken, decodeFirebaseToken } from '../../core/firebaseAuth.ts';

interface RequestOtpBody {
  phone: string;
}

interface VerifyOtpBody {
  phone: string;
  otp: string;
}

interface VerifyStudentBody {
  userId: string;
  rollNumber: string;
  institution: string;
  email: string;
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Request phone OTP
  fastify.post<{ Body: RequestOtpBody }>('/request-otp', async (request, reply) => {
    const { phone } = request.body || {};
    if (!phone) {
      return reply.code(400).send({ error: 'Phone number is required.' });
    }

    try {
      const result = securityService.requestPhoneOtp(phone);
      return reply.send(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request OTP';
      return reply.code(400).send({ error: message });
    }
  });

  // Verify OTP
  fastify.post<{ Body: VerifyOtpBody }>('/verify-otp', async (request, reply) => {
    const { phone, otp } = request.body || {};
    if (!phone || !otp) {
      return reply.code(400).send({ error: 'Phone and OTP are required.' });
    }

    const { verified, token } = securityService.verifyPhoneOtp(phone, otp);
    if (!verified) {
      return reply.code(401).send({
        error: 'Invalid or expired OTP. Use demo verification code 482910.'
      });
    }

    return reply.send({
      success: true,
      verified: true,
      token,
      user: {
        id: 'usr-demo-student',
        phone: phone.replace(/\D/g, '').slice(-10),
        name: 'Amanpreet Singh',
        role: 'RENTER',
        institution: 'Chandigarh University (CU)'
      }
    });
  });

  // Verify campus student status
  fastify.post<{ Body: VerifyStudentBody }>('/verify-student', async (request, reply) => {
    const { userId, rollNumber, institution, email } = request.body || {};
    if (!userId || !rollNumber || !institution || !email) {
      return reply.code(400).send({
        error: 'userId, rollNumber, institution, and email are required.'
      });
    }

    const record = securityService.verifyStudent({
      userId,
      rollNumber,
      institution,
      email
    });

    return reply.send({
      success: true,
      message: `Verified student status for ${institution}`,
      record
    });
  });

  // Current user status
  fastify.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = parseBearerToken(authHeader);
    const decoded = token ? decodeFirebaseToken(token) : null;

    const query = request.query as { userId?: string };
    const userId = decoded?.uid || query.userId || 'usr-demo-student';

    // Auto-register student status if institutional domain is confirmed via verified token
    if (decoded?.isStudent && decoded.email && !securityService.getStudentStatus(userId)) {
      securityService.verifyStudent({
        userId,
        rollNumber: decoded.email.split('@')[0].toUpperCase(),
        institution: decoded.institution || 'Verified University',
        email: decoded.email
      });
    }

    const studentStatus = securityService.getStudentStatus(userId);
    const licenseStatus = securityService.getLicenseStatus(userId);

    return reply.send({
      userId,
      name: decoded?.name || 'Amanpreet Singh',
      phone: decoded?.phone_number || '9876543210',
      email: decoded?.email,
      studentStatus,
      licenseStatus,
      isVerifiedCampusStudent: Boolean(studentStatus || decoded?.isStudent),
      isLicenseVerified: Boolean(licenseStatus?.verified),
      authMethod: decoded ? (decoded.isDemo ? 'DEMO_SESSION' : 'FIREBASE_JWT') : 'GUEST_DEFAULT'
    });
  });
};
