import { DenunciaRepository } from '../repositories/denunciaRepository.js';

export class DenunciaService {
  static async criarDenuncia(dados) {
    if (!dados.titulo || !dados.descricao || !dados.localidade) {
      throw new Error('Título, descrição e local da denúncia são obrigatórios');
    }

    const denunciaId = await DenunciaRepository.criar(dados);
    return { id: denunciaId, ...dados, status: 'pendente' };
  }
}
