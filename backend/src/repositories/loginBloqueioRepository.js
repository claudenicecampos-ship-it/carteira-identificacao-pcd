import pool from '../config/database.js';

export class LoginBloqueioRepository {
  static async buscarPorEmail(email) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM login_bloqueios WHERE email = ?',
        [email]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar bloqueio de login: ' + erro.message);
    }
  }

  static async buscarPorId(id) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM login_bloqueios WHERE id = ?',
        [id]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar bloqueio de login por id: ' + erro.message);
    }
  }

  static async removerPorId(id) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'DELETE FROM login_bloqueios WHERE id = ?',
        [id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao remover bloqueio de login: ' + erro.message);
    }
  }

  static async criarOuAtualizar(email, dados) {
    try {
      const conexao = await pool.getConnection();
      const bloqueioExistente = await this.buscarPorEmail(email);

      if (bloqueioExistente) {
        const campos = [];
        const valores = [];

        Object.keys(dados).forEach(chave => {
          campos.push(`${chave} = ?`);
          valores.push(dados[chave]);
        });

        valores.push(email);

        await conexao.execute(
          `UPDATE login_bloqueios SET ${campos.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE email = ?`,
          valores
        );
      } else {
        await conexao.execute(
          `INSERT INTO login_bloqueios (email, tentativas, bloqueado_ate, codigo_desbloqueio, ultima_tentativa)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            email,
            dados.tentativas || 0,
            dados.bloqueado_ate || null,
            dados.codigo_desbloqueio || null
          ]
        );
      }

      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao criar/atualizar bloqueio de login: ' + erro.message);
    }
  }

  static async resetarBloqueio(email) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        `UPDATE login_bloqueios SET tentativas = 0, bloqueado_ate = NULL, codigo_desbloqueio = NULL, ultima_tentativa = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP WHERE email = ?`,
        [email]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao resetar bloqueio de login: ' + erro.message);
    }
  }

  static async registrarFalha(email, maxTentativas = 3, minutosBloqueio = 5) {
    try {
      const conexao = await pool.getConnection();
      const bloqueioExistente = await this.buscarPorEmail(email);
      const agora = new Date();
      let tentativas = 1;
      let bloqueadoAte = null;
      let codigoDesbloqueio = null;
      let segundosRestantes = 0;

      if (bloqueioExistente) {
        tentativas = (bloqueioExistente.tentativas || 0) + 1;
      }

      if (tentativas >= maxTentativas) {
        // FORÇA: sempre 5 minutos (300 segundos)
        const BLOQUEIO_MINUTOS = 5;
        segundosRestantes = BLOQUEIO_MINUTOS * 60;
        bloqueadoAte = new Date(agora.getTime() + BLOQUEIO_MINUTOS * 60000);
        codigoDesbloqueio = `UNLOCK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        tentativas = 0;
      }

      await this.criarOuAtualizar(email, {
        tentativas,
        bloqueado_ate: bloqueadoAte,
        codigo_desbloqueio: codigoDesbloqueio
      });

      conexao.release();

      return {
        tentativas,
        bloqueadoAte,
        codigoDesbloqueio,
        restantes: tentativas > 0 ? maxTentativas - tentativas : 0,
        segundosRestantes
      };
    } catch (erro) {
      throw new Error('Erro ao registrar falha de login: ' + erro.message);
    }
  }

  static async desbloquearPorCodigo(email, codigo) {
    try {
      const bloqueio = await this.buscarPorEmail(email);
      if (!bloqueio || !bloqueio.codigo_desbloqueio) {
        return false;
      }
      if (bloqueio.codigo_desbloqueio !== codigo) {
        return false;
      }

      await this.resetarBloqueio(email);
      return true;
    } catch (erro) {
      throw new Error('Erro ao desbloquear login por código: ' + erro.message);
    }
  }
}
