-- =====================================================================
-- DadosRecife (TechMinds) - Script de inserção de dados (DML)
-- Os valores numéricos estão como 'xxx' (dados demonstrativos) e devem
-- ser substituídos pelos dados oficiais na versão final.
-- =====================================================================

-- Usuário de teste: gestor@dadosrecife.com / senha 123456 (hash scrypt)
INSERT INTO usuarios (nome, email, senha_hash, salt) VALUES (
  'Gestor',
  'gestor@dadosrecife.com',
  'e3aaebaf2dc5bf39daecc4b07ef001bc630292fd5e842bfca1297ec99d66357fcdedfed5e68c0ae8823dcf2383b0e44ee151962fc274ec058e362827adaba614',
  '8e48afefa7ca85c79ecfd8bd0afbbd47'
);

INSERT INTO periodos (rotulo, ordem) VALUES
  ('xxx trimestre/xxxx (anterior)', 1),
  ('xxx trimestre/xxxx', 2);

-- Bairros e posição no mapa (coluna, linha)
INSERT INTO bairros (nome, grid_col, grid_row) VALUES
  ('Bairro A', 2, 1), ('Bairro B', 3, 1), ('Bairro C', 4, 1), ('Bairro D', 5, 1), ('Bairro E', 6, 1),
  ('Bairro F', 1, 2), ('Bairro G', 2, 2), ('Bairro H', 3, 2), ('Bairro I', 4, 2),
  ('Bairro J', 2, 3), ('Bairro K', 3, 3), ('Bairro L', 4, 3), ('Bairro M', 5, 3), ('Bairro N', 6, 3),
  ('Bairro O', 1, 4), ('Bairro P', 5, 4), ('Bairro Q', 6, 4),
  ('Bairro R', 1, 5), ('Bairro S', 2, 5), ('Bairro T', 3, 5), ('Bairro U', 4, 5), ('Bairro V', 5, 5), ('Bairro W', 6, 5),
  ('Bairro X', 1, 6);

-- Indicadores de cada bairro em cada período (faixas = cor no mapa, de 1 a 5)
INSERT INTO indicadores_bairro (
  bairro_id, periodo_id, desemprego, empregos_formais, informalidade, renda_media,
  desemprego_jovem, populacao_ativa, participacao_formal, variacao, faixa_desemprego, faixa_renda
)
SELECT b.id, p.id, 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', f.column2, f.column3
FROM (VALUES
  ('Bairro A', 1, 1), ('Bairro B', 2, 2), ('Bairro C', 3, 3), ('Bairro D', 4, 4), ('Bairro E', 5, 5),
  ('Bairro F', 1, 1), ('Bairro G', 2, 2), ('Bairro H', 3, 3), ('Bairro I', 4, 4),
  ('Bairro J', 5, 5), ('Bairro K', 1, 1), ('Bairro L', 2, 2), ('Bairro M', 3, 3), ('Bairro N', 4, 4),
  ('Bairro O', 5, 5), ('Bairro P', 1, 1), ('Bairro Q', 2, 2),
  ('Bairro R', 3, 3), ('Bairro S', 4, 4), ('Bairro T', 5, 5), ('Bairro U', 1, 1), ('Bairro V', 2, 2), ('Bairro W', 3, 3),
  ('Bairro X', 4, 4)
) AS f
JOIN bairros b ON b.nome = f.column1
CROSS JOIN periodos p;

-- Cards da Visão Geral (período mais recente)
INSERT INTO indicadores_gerais (periodo_id, chave, rotulo, valor, variacao, tendencia)
SELECT id, 'desemprego', 'Taxa de desemprego', 'xxx', 'xxx p.p. no período', 'baixa' FROM periodos WHERE ordem = 2
UNION ALL
SELECT id, 'empregos',   'Empregos formais',   'xxx', 'xxx% no período',     'alta'  FROM periodos WHERE ordem = 2
UNION ALL
SELECT id, 'informal',   'Trabalho informal',  'xxx', 'Indicador municipal', 'neutra' FROM periodos WHERE ordem = 2
UNION ALL
SELECT id, 'renda',      'Renda média mensal', 'xxx', 'xxx% no período',     'alta'  FROM periodos WHERE ordem = 2;

-- Séries dos gráficos
INSERT INTO series_grafico (chave, ordem, rotulo, valor, forma) VALUES
  ('evolucao_desemprego', 1, 'Período 1', 'xxx', 0.80),
  ('evolucao_desemprego', 2, 'Período 2', 'xxx', 0.72),
  ('evolucao_desemprego', 3, 'Período 3', 'xxx', 0.62),
  ('evolucao_desemprego', 4, 'Período 4', 'xxx', 0.52),
  ('evolucao_desemprego', 5, 'Período 5', 'xxx', 0.44),
  ('evolucao_bairro', 1, 'Período 1', 'xxx', 0.45),
  ('evolucao_bairro', 2, 'Período 2', 'xxx', 0.30),
  ('evolucao_bairro', 3, 'Período 3', 'xxx', 0.55),
  ('evolucao_bairro', 4, 'Período 4', 'xxx', 0.15),
  ('evolucao_bairro', 5, 'Período 5', 'xxx', 0.70),
  ('evolucao_bairro', 6, 'Período 6', 'xxx', 0.55);

INSERT INTO configuracoes (chave, valor) VALUES
  ('ultima_atualizacao', 'xxx trimestre de xxxx');
