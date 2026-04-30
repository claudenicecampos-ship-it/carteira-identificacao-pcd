-- Banco de Dados: Carteira
-- Database: carteira
-- Versão: 1.0

CREATE DATABASE IF NOT EXISTS carteira CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE carteira;

SET NAMES utf8mb4;


CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    data_nascimento DATE,
    qr_code VARCHAR(191) UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_ativa (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Carteiras
CREATE TABLE IF NOT EXISTS carteiras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo VARCHAR(50) NOT NULL,
    numero_carteira VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    data_nascimento DATE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    telefone VARCHAR(15),
    tipo_deficiencia VARCHAR(50),
    grau_deficiencia VARCHAR(50),
    cid VARCHAR(20),
    necessita_acompanhante BOOLEAN DEFAULT FALSE,
    numero_laudo VARCHAR(100),
    data_laudo DATE,
    nome_medico VARCHAR(255),
    crm_medico VARCHAR(100),
    foto VARCHAR(255),
    laudo_url VARCHAR(255),
    tipo_sanguineo VARCHAR(5),
    contato_emergencia VARCHAR(255),
    alergias TEXT,
    medicacoes TEXT,
    comunicacao VARCHAR(100),
    nome_responsavel VARCHAR(255),
    cpf_responsavel VARCHAR(14),
    vinculo_responsavel VARCHAR(100),
    nome VARCHAR(255),
    cpf VARCHAR(11),
    rg VARCHAR(20),
    sexo VARCHAR(10),
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ativa (ativa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Denúncias
CREATE TABLE IF NOT EXISTS denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_denuncia VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pendente',
    prioridade VARCHAR(20) DEFAULT 'normal',
    localidade TEXT,
    endereco TEXT,
    evidencia_url TEXT,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolvida_em TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_status (status),
    INDEX idx_criada_em (criada_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Recuperação de Senha
CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(191) UNIQUE NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expira_em (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Auditoria (Log de ações)
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(100),
    registro_id INT,
    valores_antigos TEXT,
    valores_novos TEXT,
    endereco_ip VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token_refresh VARCHAR(191) UNIQUE NOT NULL,
    endereco_ip VARCHAR(45),
    user_agent TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NOT NULL,
    ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token_refresh),
    INDEX idx_ativa (ativa),
    INDEX idx_expira_em (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    permissoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir dados de teste (opcional)
INSERT INTO usuarios (nome, email, senha, cpf, telefone, data_nascimento, role) VALUES
('Administrador', 'admin@carteira.com', '$2a$10$iW6VJy5EzmpcC535JcL9rehDIZ2pAYD2LDIjf8NU53xu1VD4RHSHS', '12345678901', '1111111111', '1990-01-01', 'admin');

INSERT INTO administradores (usuario_id, permissoes) VALUES
(1, 'gerenciar_denuncias,gerenciar_usuarios');

-- Tabela de bloqueio de login para controlar tentativas e desbloqueio manual
CREATE TABLE IF NOT EXISTS login_bloqueios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    tentativas INT DEFAULT 0,
    bloqueado_ate TIMESTAMP NULL,
    codigo_desbloqueio VARCHAR(191),
    ultima_tentativa TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Código de desbloqueio de exemplo para uso manual
INSERT INTO login_bloqueios (email, tentativas, bloqueado_ate, codigo_desbloqueio) VALUES
('admin@carteira.com', 0, NULL, 'DESBLOQUEIO123');

-- Consultas úteis para verificar todas as tabelas do banco
SELECT * FROM usuarios;
SELECT * FROM carteiras;
SELECT * FROM denuncias;
SELECT * FROM recuperacao_senha;
SELECT * FROM auditoria;
SELECT * FROM sessoes;
SELECT * FROM administradores;
SELECT * FROM login_bloqueios;

-- Use este SQL no banco carteira para desbloquear manualmente:

-- Primeiro, verifique qual email e código de desbloqueio estão gravados:
SELECT email, tentativas, bloqueado_ate, codigo_desbloqueio FROM login_bloqueios WHERE email = 'admin@carteira.com';

-- Desbloqueio pelo email (recomendado quando você quer resetar a conta bloqueada):
UPDATE login_bloqueios
SET tentativas = 0,
    bloqueado_ate = NULL,
    codigo_desbloqueio = NULL,
    ultima_tentativa = NOW(),
    atualizado_em = NOW()
WHERE email = 'admin@carteira.com';
-- drop database carteira
-- IMPORTANTE: substitua admin@carteira.com pelo email real do usuário bloqueado pelo código que está na coluna codigo_desbloqueio.