import { CarteiraRepository } from '../repositories/carteiraRepository.js';

export class CarteiraService {
  static async criarCarteira(dados) {
    // Gera numero da carteira se nao informado
    if (!dados.numero_carteira) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      dados.numero_carteira = `GC${timestamp}${random}`;
    }

    const carteiraId = await CarteiraRepository.criar(dados);
    return { id: carteiraId, ...dados };
  }

  static async buscarPorUsuario(usuario_id) {
    return await CarteiraRepository.buscarPorUsuarioId(usuario_id);
  }
}
