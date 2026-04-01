import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Gera QR Code único para o usuário
 * @param {number} usuario_id - ID do usuário
 * @param {string} email - Email do usuário
 * @returns {Promise<string>} - QR Code em base64
 */
export const gerarQRCode = async (usuario_id, email) => {
  try {
    // Criar um identificador único combinando usuario_id e um hash seguro
    const dadosQR = `carteira:${usuario_id}:${email}:${Date.now()}`;
    const hash = crypto
      .createHash('sha256')
      .update(dadosQR + process.env.QR_CODE_SECRET)
      .digest('hex')
      .substring(0, 16);

    const codigoUnico = `${usuario_id}-${hash}`;

    // Gerar QR Code
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
