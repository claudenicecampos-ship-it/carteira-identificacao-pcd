-- Banco de Dados: Carteira
-- Database: carteira
-- Versão: 1.0

CREATE DATABASE IF NOT EXISTS carteira CHARACTER SET utf8 COLLATE utf8_general_ci;
USE carteira;

SET NAMES utf8;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    data_nascimento DATE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    qr_code VARCHAR(191) UNIQUE,
    refreshToken VARCHAR(191),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela de Carteiras
CREATE TABLE carteiras (
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
    cep VARCHAR(10),
    telefone VARCHAR(15),
    tipo_deficiencia VARCHAR(50),
    grau_deficiencia VARCHAR(50),
    cid VARCHAR(20),
    necessita_acompanhante BOOLEAN DEFAULT FALSE,
    numero_laudo VARCHAR(100),
    data_laudo DATE,
    nome_medico VARCHAR(255),
    crm_medico VARCHAR(100),
    foto TEXT,
    laudo_url TEXT,
    tipo_sanguineo VARCHAR(5),
    contato_emergencia VARCHAR(255),
    alergias TEXT,
    medicacoes TEXT,
    comunicacao VARCHAR(100),
    nome_responsavel VARCHAR(255),
    cpf_responsavel VARCHAR(14),
    vinculo_responsavel VARCHAR(100),
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ativa (ativa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela de Denúncias
CREATE TABLE denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_denuncia VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pendente',
    prioridade VARCHAR(20) DEFAULT 'normal',
    localidade TEXT,
    evidencia_url TEXT,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolvida_em TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_status (status),
    INDEX idx_criada_em (criada_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela de Recuperação de Senha
CREATE TABLE recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expira_em (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela de Auditoria (Log de ações)
CREATE TABLE auditoria (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela de Sessões
CREATE TABLE sessoes (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Inserir dados de teste (opcional)
INSERT INTO usuarios (nome, email, senha, cpf, telefone, data_nascimento) VALUES
('Administrador', 'admin@carteira.com', '$2b$10$example_hash', '12345678901', '1111111111', '1990-01-01');

