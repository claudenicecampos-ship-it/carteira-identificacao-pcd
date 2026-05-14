import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera QR Code único usando UUID v4
 * @returns {Promise<{qrCode: string, codigoUnico: string}>} - QR Code em base64 e UUID
 */
export const gerarQRCode = async () => {
  try {
    const codigoUnico = uuidv4();
    const qrCodeBase64 = await QRCode.toDataURL(codigoUnico);
    return {
      qrCode: qrCodeBase64,
      codigoUnico: codigoUnico
    };
  } catch (erro) {
    throw new Error('Erro ao gerar QR Code: ' + erro.message);
  }
};

/**
 * Valida QR Code
 * @param {string} codigoQR - Código QR a validar
 * @returns {boolean} - True se válido
 */
export const validarQRCode = (codigoQR) => {
  // Validar formato do código único
  const regex = /^\d+-[a-f0-9]{16}$/;
  return regex.test(codigoQR);
};
