import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a cryptographically secure random token and its SHA256 hash
 */
export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

/**
 * Generate a base64 Data URL for a given payload (e.g. check-in QR pass)
 */
export const generateQRCodeDataUrl = async (payload) => {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    throw new Error(`Failed to generate QR Code: ${err.message}`);
  }
};
