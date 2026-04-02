import { DenunciaService } from '../services/denunciaService.js';

export class DenunciaController {
  static async criar(req, res) {
    try {
      const dados = {
        usuario_id: req.body.usuario_id || null,
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        tipo_denuncia: req.body.tipo_denuncia,
        prioridade: req.body.prioridade,
        localidade: req.body.localidade,
        evidencia_url: req.body.evidencia_url
      };

      const denuncia = await DenunciaService.criarDenuncia(dados);
      res.status(201).json({ sucesso: true, mensagem: 'Denúncia registrada com sucesso', data: denuncia });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}
