import { AdminService } from '../services/adminService.js';

export class AdminController {
  static async listarUsuarios(req, res) {
    try {
      const usuarios = await AdminService.listarUsuarios();
      res.status(200).json({ sucesso: true, data: usuarios });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async listarCarteiras(req, res) {
    try {
      const carteiras = await AdminService.listarCarteiras();
      res.status(200).json({ sucesso: true, data: carteiras });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async listarDenuncias(req, res) {
    try {
      const denuncias = await AdminService.listarDenuncias();
      res.status(200).json({ sucesso: true, data: denuncias });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async atualizarUsuarioStatus(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { ativa } = req.body;
      if (Number.isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID inválido' });
      }
      await AdminService.atualizarUsuarioStatus(id, !!ativa);
      res.status(200).json({ sucesso: true, mensagem: 'Status do usuário atualizado com sucesso' });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async atualizarCarteiraStatus(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { ativa } = req.body;
      if (Number.isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID inválido' });
      }
      await AdminService.atualizarCarteiraStatus(id, !!ativa);
      res.status(200).json({ sucesso: true, mensagem: 'Status da carteira atualizado com sucesso' });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}
