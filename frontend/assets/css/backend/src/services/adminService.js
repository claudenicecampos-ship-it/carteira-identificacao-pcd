import { AdminRepository } from '../repositories/adminRepository.js';
import { DenunciaRepository } from '../repositories/denunciaRepository.js';

export class AdminService {
  static async listarUsuarios() {
    return await AdminRepository.listarUsuarios();
  }

  static async listarCarteiras() {
    return await AdminRepository.listarCarteiras();
  }

  static async listarDenuncias() {
    return await DenunciaRepository.listarTodas();
  }

  static async atualizarUsuarioStatus(id, ativa) {
    return await AdminRepository.atualizarUsuarioStatus(id, ativa);
  }

  static async atualizarCarteiraStatus(id, ativa) {
    return await AdminRepository.atualizarCarteiraStatus(id, ativa);
  }
}
