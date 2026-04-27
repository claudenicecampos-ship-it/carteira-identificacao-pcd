import { DenunciaService } from '../services/denunciaService.js';

export class DenunciaController {
  static async criar(req, res) {
    try {
      const dados = {
        usuario_id: req.usuario_id,
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        tipo_denuncia: req.body.tipo_denuncia,
        prioridade: req.body.prioridade,
        localidade: req.body.localidade,
        endereco: req.body.endereco,
        evidencia_url: req.body.evidencia_url
      };

      const denuncia = await DenunciaService.criarDenuncia(dados);
      res.status(201).json({ sucesso: true, mensagem: 'Denúncia registrada com sucesso', data: denuncia });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async listarTodas(req, res) {
    try {
      const denuncias = await DenunciaService.listarTodas();
      res.status(200).json({ sucesso: true, data: denuncias });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async resolver(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID inválido' });
      }

      await DenunciaService.resolver(id);
      res.status(200).json({ sucesso: true, mensagem: 'Denúncia marcada como resolvida' });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}

