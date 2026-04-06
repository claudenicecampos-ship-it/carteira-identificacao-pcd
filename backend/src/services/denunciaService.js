import { DenunciaRepository } from '../repositories/denunciaRepository.js';

export class DenunciaService {
  static async criarDenuncia(dados) {
    if (!dados.titulo || !dados.descricao || !dados.localidade) {
      throw new Error('Título, descrição e local da denúncia são obrigatórios');
    }

    dados.status = dados.status || 'pendente';
    if (dados.status === 'resolvida' && !dados.resolvida_em) {
      dados.resolvida_em = new Date();
    }

    const denunciaId = await DenunciaRepository.criar(dados);
    return { id: denunciaId, ...dados };
  }

  static async listarTodas() {
    return await DenunciaRepository.listarTodas();
  }

  static async resolver(id) {
    const denuncia = await DenunciaRepository.buscarPorId(id);
    if (!denuncia) {
      throw new Error('Denúncia não encontrada');
    }

    if (denuncia.status === 'resolvida') {
      throw new Error('Denúncia já está resolvida');
    }

    await DenunciaRepository.marcarResolvida(id);
  }
}

