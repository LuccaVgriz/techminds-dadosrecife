-- =====================================================================
-- DadosRecife (TechMinds) - Script de criação do banco de dados (DDL)
-- SGBD: SQLite
-- =====================================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS sessoes;
DROP TABLE IF EXISTS indicadores_bairro;
DROP TABLE IF EXISTS indicadores_gerais;
DROP TABLE IF EXISTS series_grafico;
DROP TABLE IF EXISTS periodos;
DROP TABLE IF EXISTS bairros;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS configuracoes;

-- Usuários que acessam o painel
CREATE TABLE usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  senha_hash  TEXT    NOT NULL,            -- hash scrypt da senha
  salt        TEXT    NOT NULL,
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Sessões de login (token enviado no cabeçalho Authorization)
CREATE TABLE sessoes (
  token       TEXT    PRIMARY KEY,
  usuario_id  INTEGER NOT NULL,
  expira_em   INTEGER NOT NULL,            -- timestamp em milissegundos
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Bairros do Recife e sua posição no mapa demonstrativo
CREATE TABLE bairros (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL UNIQUE,
  grid_col  INTEGER NOT NULL CHECK (grid_col BETWEEN 1 AND 6),
  grid_row  INTEGER NOT NULL CHECK (grid_row BETWEEN 1 AND 6)
);

-- Períodos de referência dos dados (ex.: 1º trimestre/2026)
CREATE TABLE periodos (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  rotulo  TEXT    NOT NULL,
  ordem   INTEGER NOT NULL UNIQUE           -- maior ordem = período mais recente
);

-- Indicadores de cada bairro em cada período
CREATE TABLE indicadores_bairro (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  bairro_id            INTEGER NOT NULL,
  periodo_id           INTEGER NOT NULL,
  desemprego           REAL,               -- %
  empregos_formais     INTEGER,
  informalidade        REAL,               -- %
  renda_media          REAL,               -- R$
  desemprego_jovem     REAL,               -- %
  populacao_ativa      INTEGER,
  participacao_formal  REAL,               -- %
  variacao             REAL,               -- %
  faixa_desemprego     INTEGER CHECK (faixa_desemprego BETWEEN 1 AND 5),
  faixa_renda          INTEGER CHECK (faixa_renda BETWEEN 1 AND 5),
  UNIQUE (bairro_id, periodo_id),
  FOREIGN KEY (bairro_id)  REFERENCES bairros(id)  ON DELETE CASCADE,
  FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
);

-- Indicadores do município (cards da Visão Geral)
CREATE TABLE indicadores_gerais (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  periodo_id  INTEGER NOT NULL,
  chave       TEXT    NOT NULL,            -- desemprego | empregos | informal | renda
  rotulo      TEXT    NOT NULL,
  valor       REAL,
  variacao    TEXT,
  tendencia   TEXT    CHECK (tendencia IN ('alta', 'baixa', 'neutra')),
  UNIQUE (periodo_id, chave),
  FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
);

-- Pontos das séries dos gráficos de evolução
CREATE TABLE series_grafico (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  chave   TEXT    NOT NULL,                -- evolucao_desemprego | evolucao_bairro
  ordem   INTEGER NOT NULL,
  rotulo  TEXT    NOT NULL,
  valor   REAL,
  forma   REAL    NOT NULL,                -- altura do ponto no gráfico (0 a 1)
  UNIQUE (chave, ordem)
);

-- Configurações gerais da plataforma
CREATE TABLE configuracoes (
  chave  TEXT PRIMARY KEY,
  valor  TEXT
);

CREATE INDEX idx_sessoes_usuario   ON sessoes(usuario_id);
CREATE INDEX idx_indicadores_bairro ON indicadores_bairro(bairro_id);
CREATE INDEX idx_indicadores_periodo ON indicadores_bairro(periodo_id);
