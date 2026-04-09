import { CarteiraService } from '../services/carteiraService.js';

export class CarteiraController {
  static async criar(req, res) {
    try {
      const body = req.body;
      const numeroCarteira = body.numero_carteira || body.numeroCarteira || `GO-PCD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const dados = {
        usuario_id: req.usuario_id,
        tipo: body.tipo || body.tipoCarteira || 'PCD',
        numero_carteira: numeroCarteira,
        descricao: body.descricao || body.descricaoCarteira || 'Carteira GO Card PCD',
        data_nascimento: body.data_nascimento || body.dataNascimento || null,
        endereco: body.endereco || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,
        telefone: body.telefone || null,
        tipo_deficiencia: body.tipo_deficiencia || body.tipoDeficiencia || null,
        grau_deficiencia: body.grau_deficiencia || body.grauDeficiencia || null,
        cid: body.cid || null,
        necessita_acompanhante: body.necessita_acompanhante === true || String(body.necessita_acompanhante).toLowerCase() === 'sim',
        numero_laudo: body.numero_laudo || body.numeroLaudo || null,
        data_laudo: body.data_laudo || body.dataLaudo || null,
        nome_medico: body.nome_medico || body.nomeMedico || null,
        crm_medico: body.crm_medico || body.crmMedico || null,
        foto: body.foto || null,
        laudo_url: body.laudo_url || body.laudoArquivo || null,
        tipo_sanguineo: body.tipo_sanguineo || body.tipoSanguineo || null,
        contato_emergencia: body.contato_emergencia || body.contatoEmergencia || null,
        alergias: body.alergias || null,
        medicacoes: body.medicacoes || null,
        comunicacao: body.comunicacao || null,
        nome_responsavel: body.nome_responsavel || body.nomeResponsavel || null,
        cpf_responsavel: body.cpf_responsavel || body.cpfResponsavel || null,
        vinculo_responsavel: body.vinculo_responsavel || body.vinculoResponsavel || null,
        nome: body.nome || null,
        cpf: body.cpf || null,
        rg: body.rg || null,
        sexo: body.sexo || null
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
