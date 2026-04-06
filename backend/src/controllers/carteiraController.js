import { CarteiraService } from '../services/carteiraService.js';

export class CarteiraController {
  static async criar(req, res) {
    try {
      const dados = {
        usuario_id: req.usuario_id,
        tipo: req.body.tipo,
        descricao: req.body.descricao,
        data_nascimento: req.body.data_nascimento,
        endereco: req.body.endereco,
        cidade: req.body.cidade,
        estado: req.body.estado,
        cep: req.body.cep,
        telefone: req.body.telefone,
        tipo_deficiencia: req.body.tipo_deficiencia,
        grau_deficiencia: req.body.grau_deficiencia,
        cid: req.body.cid,
        necessita_acompanhante: req.body.necessita_acompanhante,
        numero_laudo: req.body.numero_laudo,
        data_laudo: req.body.data_laudo,
        nome_medico: req.body.nome_medico,
        crm_medico: req.body.crm_medico,
        foto: req.body.foto,
        laudo_url: req.body.laudoArquivo || req.body.laudo_url,
        tipo_sanguineo: req.body.tipo_sanguineo,
        contato_emergencia: req.body.contato_emergencia,
        alergias: req.body.alergias,
        medicacoes: req.body.medicacoes,
        comunicacao: req.body.comunicacao,
        nome_responsavel: req.body.nome_responsavel,
        cpf_responsavel: req.body.cpf_responsavel,
        vinculo_responsavel: req.body.vinculo_responsavel
      };

      const carteira = await CarteiraService.criarCarteira(dados);
      res.status(201).json({ sucesso: true, mensagem: 'Carteira criada com sucesso', data: carteira });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async buscarMinha(req, res) {
    try {
      const carteira = await CarteiraService.buscarPorUsuario(req.usuario_id);
      if (carteira) {
        res.status(200).json({ sucesso: true, data: carteira });
      } else {
        res.status(404).json({ sucesso: false, mensagem: 'Carteira não encontrada' });
      }
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}
