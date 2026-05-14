import { CarteiraService } from '../services/carteiraService.js';
import { gerarCodigoVerificacao } from '../utils/validacao.js';
import { gerarQRCode } from '../utils/qrcode.js';
import { logger } from '../utils/logger.js';

export class CarteiraController {
  static prepararDadosCarteira(req, numeroCarteira = null) {
    const body = req.body;
    const files = req.files || {};
    const fotoFile = files.foto?.[0];
    const laudoFile = files.laudo?.[0];
    const fotoPath = fotoFile ? `imgs/${fotoFile.filename}` : (body.foto && !String(body.foto).startsWith('data:') ? body.foto : null);
    const laudoPath = laudoFile ? `laudos/${laudoFile.filename}` : (body.laudo_url && !String(body.laudo_url).startsWith('data:') ? body.laudo_url : (body.laudoArquivo && !String(body.laudoArquivo).startsWith('data:') ? body.laudoArquivo : null));

    return {
      usuario_id: req.usuario_id,
      tipo: body.tipo || body.tipoCarteira || 'PCD',
      numero_carteira: numeroCarteira || body.numero_carteira || body.numeroCarteira || `GO-PCD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      codigo_verificacao: body.codigo_verificacao || gerarCodigoVerificacao(),
      descricao: body.descricao || body.descricaoCarteira || 'Carteira GO Card PCD',
      data_nascimento: body.data_nascimento || body.dataNascimento || null,
      endereco: body.endereco || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      telefone: body.telefone || null,
      tipo_deficiencia: body.tipo_deficiencia || body.tipoDeficiencia || null,
      grau_deficiencia: body.grau_deficiencia || body.grauDeficiencia || null,
      cid: body.cid || null,
      necessita_acompanhante: body.necessita_acompanhante === true || String(body.necessita_acompanhante).toLowerCase() === 'sim' || String(body.necessita_acompanhante).toLowerCase() === 'true',
      numero_laudo: body.numero_laudo || body.numeroLaudo || null,
      data_laudo: body.data_laudo || body.dataLaudo || null,
      nome_medico: body.nome_medico || body.nomeMedico || null,
      crm_medico: body.crm_medico || body.crmMedico || null,
      foto: fotoPath,
      laudo_url: laudoPath,
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
  }

  static async criar(req, res) {
    try {
      const body = req.body;
      const numeroCarteira = body.numero_carteira || body.numeroCarteira || `GO-PCD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const files = req.files || {};
      const fotoFile = files.foto?.[0];
      const laudoFile = files.laudo?.[0];
      // Armazena o caminho relativo para a pasta pública /imgs do backend.
      const fotoPath = fotoFile ? `imgs/${fotoFile.filename}` : (body.foto && !String(body.foto).startsWith('data:') ? body.foto : null);
      const laudoPath = laudoFile ? `laudos/${laudoFile.filename}` : (body.laudo_url && !String(body.laudo_url).startsWith('data:') ? body.laudo_url : (body.laudoArquivo && !String(body.laudoArquivo).startsWith('data:') ? body.laudoArquivo : null));

      // Gera QR code único
      const { qrCode, codigoUnico } = await gerarQRCode();

      logger.info('Iniciando fluxo de criação de carteira', {
        usuario_id: req.usuario_id,
        numero_carteira: numeroCarteira,
        tipo: body.tipo || body.tipoCarteira || 'PCD',
        upload_foto: !!fotoFile,
        upload_laudo: !!laudoFile,
        fonte_foto: fotoFile ? 'upload' : body.foto ? 'body' : 'nenhuma',
        fonte_laudo: laudoFile ? 'upload' : body.laudo_url ? 'body_url' : body.laudoArquivo ? 'body_file' : 'nenhuma',
        codigo_qr: codigoUnico
      });

      const dados = {
        usuario_id: req.usuario_id,
        tipo: body.tipo || body.tipoCarteira || 'PCD',
        numero_carteira: numeroCarteira,
        codigo_verificacao: body.codigo_verificacao || gerarCodigoVerificacao(),
        descricao: body.descricao || body.descricaoCarteira || 'Carteira GO Card PCD',
        data_nascimento: body.data_nascimento || body.dataNascimento || null,
        endereco: body.endereco || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        telefone: body.telefone || null,
        tipo_deficiencia: body.tipo_deficiencia || body.tipoDeficiencia || null,
        grau_deficiencia: body.grau_deficiencia || body.grauDeficiencia || null,
        cid: body.cid || null,
        necessita_acompanhante: body.necessita_acompanhante === true || String(body.necessita_acompanhante).toLowerCase() === 'sim',
        numero_laudo: body.numero_laudo || body.numeroLaudo || null,
        data_laudo: body.data_laudo || body.dataLaudo || null,
        nome_medico: body.nome_medico || body.nomeMedico || null,
        crm_medico: body.crm_medico || body.crmMedico || null,
        foto: fotoPath,
        laudo_url: laudoPath,
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
        sexo: body.sexo || null,
        codigo_qr: codigoUnico
      };

      logger.info('Dados de criação de carteira preparados', {
        usuario_id: dados.usuario_id,
        numero_carteira: dados.numero_carteira,
        nome: dados.nome,
        cpf: dados.cpf,
        tipo_deficiencia: dados.tipo_deficiencia,
        grau_deficiencia: dados.grau_deficiencia,
        tem_foto: !!dados.foto,
        tem_laudo: !!dados.laudo_url,
        codigo_qr: dados.codigo_qr
      });

      const carteira = await CarteiraService.criarCarteira(dados);
      res.status(201).json({ sucesso: true, mensagem: 'Carteira criada com sucesso', data: { ...carteira, qrCodeBase64: qrCode, codigo_qr: codigoUnico } });
    } catch (erro) {
      logger.error('Falha no fluxo de criação de carteira', { usuario_id: req.usuario_id, mensagem: erro.message, stack: erro.stack });
      const status = erro.status || 400;
      res.status(status).json({ sucesso: false, mensagem: erro.message });
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

  static async buscarPorNumero(req, res) {
    try {
      const numeroCarteira = req.params.numeroCarteira;
      const carteira = await CarteiraService.buscarPorNumero(numeroCarteira);
      if (carteira) {
        res.status(200).json({ sucesso: true, data: carteira });
      } else {
        res.status(404).json({ sucesso: false, mensagem: 'Carteira não encontrada' });
      }
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async atualizarMinha(req, res) {
    try {
      const dados = CarteiraController.prepararDadosCarteira(req);
      const carteira = await CarteiraService.atualizarCarteira(req.usuario_id, dados);
      res.status(200).json({ sucesso: true, mensagem: 'Carteira atualizada com sucesso', data: carteira });
    } catch (erro) {
      logger.error('Falha ao atualizar carteira', { usuario_id: req.usuario_id, mensagem: erro.message, stack: erro.stack });
      const status = erro.status || 400;
      res.status(status).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async verificarCpf(req, res) {
    try {
      const cpf = req.params.cpf || req.query.cpf;
      const resultado = await CarteiraService.verificarCpf(cpf);
      res.status(200).json({ sucesso: true, data: resultado });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}
