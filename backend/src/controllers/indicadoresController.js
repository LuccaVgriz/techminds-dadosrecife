// Endpoints de dados: visão geral, bairros, mapa, comparação, períodos e download
const { db } = require('../db');
const { ErroHttp, enviarJSON } = require('../http');

// Faixas de cor (1 a 5) e legenda de cada indicador do mapa
const INDICADORES_MAPA = {
  desemprego: { titulo: 'Taxa de desemprego por bairro', campo: 'faixa_desemprego',
    legenda: ['Até xxx%', 'xxx% – xxx%', 'xxx% – xxx%', 'xxx% – xxx%', 'Acima de xxx%'] },
  renda: { titulo: 'Renda média mensal por bairro', campo: 'faixa_renda',
    legenda: ['Até R$ xxx', 'R$ xxx – xxx', 'R$ xxx – xxx', 'R$ xxx – xxx', 'Acima de R$ xxx'] },
  empregos: { titulo: 'Empregos formais por bairro', campo: 'faixa_renda',
    legenda: ['Até xxx', 'xxx – xxx', 'xxx – xxx', 'xxx – xxx', 'Acima de xxx'] },
  informalidade: { titulo: 'Trabalho informal por bairro', campo: 'faixa_desemprego',
    legenda: ['Até xxx%', 'xxx% – xxx%', 'xxx% – xxx%', 'xxx% – xxx%', 'Acima de xxx%'] }
};

// ---------- consultas auxiliares ----------
function periodoAtualId() {
  return db.prepare('SELECT id FROM periodos ORDER BY ordem DESC LIMIT 1').get().id;
}

function periodoValido(id) {
  if (!id) return periodoAtualId();
  const p = db.prepare('SELECT id FROM periodos WHERE id = ?').get(Number(id));
  if (!p) throw new ErroHttp(400, 'Período inválido.');
  return p.id;
}

function serie(chave) {
  return db.prepare('SELECT rotulo, valor, forma FROM series_grafico WHERE chave = ? ORDER BY ordem').all(chave);
}

function bairroComIndicadores(bairroId, periodoId) {
  return db.prepare(`
    SELECT b.id, b.nome, b.grid_col, b.grid_row, i.desemprego, i.empregos_formais, i.informalidade,
           i.renda_media, i.desemprego_jovem, i.populacao_ativa, i.participacao_formal, i.variacao,
           i.faixa_desemprego, i.faixa_renda
    FROM bairros b
    JOIN indicadores_bairro i ON i.bairro_id = b.id AND i.periodo_id = ?
    WHERE b.id = ?
  `).get(periodoId, Number(bairroId));
}

// ---------- endpoints ----------
function visaoGeral(req, res) {
  const periodo = periodoAtualId();
  enviarJSON(res, 200, {
    kpis: db.prepare(`SELECT chave, rotulo, valor, variacao, tendencia
                      FROM indicadores_gerais WHERE periodo_id = ? ORDER BY id`).all(periodo),
    mapa: db.prepare(`SELECT b.id, b.nome, b.grid_col, b.grid_row, i.faixa_desemprego AS faixa
                      FROM bairros b JOIN indicadores_bairro i ON i.bairro_id = b.id
                      WHERE i.periodo_id = ?`).all(periodo),
    legenda: INDICADORES_MAPA.desemprego.legenda,
    evolucao: serie('evolucao_desemprego'),
    top5: db.prepare(`SELECT b.nome, i.desemprego
                      FROM bairros b JOIN indicadores_bairro i ON i.bairro_id = b.id
                      WHERE i.periodo_id = ?
                      ORDER BY i.faixa_desemprego DESC, b.id LIMIT 5`).all(periodo)
  });
}

function listarBairros(req, res) {
  enviarJSON(res, 200, db.prepare('SELECT id, nome FROM bairros ORDER BY nome').all());
}

function detalharBairro(req, res, { params, query }) {
  const bairro = bairroComIndicadores(params.id, periodoValido(query.get('periodo')));
  if (!bairro) throw new ErroHttp(404, 'Bairro não encontrado.');
  enviarJSON(res, 200, { ...bairro, evolucao: serie('evolucao_bairro') });
}

function mapa(req, res, { query }) {
  const indicador = INDICADORES_MAPA[query.get('indicador')];
  if (!indicador) throw new ErroHttp(400, 'Indicador inválido.');
  const periodo = periodoValido(query.get('periodo'));

  // indicador.campo vem da lista fixa acima, nunca do usuário
  const bairros = db.prepare(`
    SELECT b.id, b.nome, b.grid_col, b.grid_row, i.renda_media, i.desemprego, i.${indicador.campo} AS faixa
    FROM bairros b JOIN indicadores_bairro i ON i.bairro_id = b.id
    WHERE i.periodo_id = ?
  `).all(periodo);

  enviarJSON(res, 200, { titulo: indicador.titulo, legenda: indicador.legenda, periodo, bairros });
}

function listarPeriodos(req, res) {
  enviarJSON(res, 200, db.prepare('SELECT id, rotulo FROM periodos ORDER BY ordem DESC').all());
}

function comparar(req, res, { query }) {
  const periodo = periodoAtualId();
  const b1 = bairroComIndicadores(query.get('b1'), periodo);
  const b2 = bairroComIndicadores(query.get('b2'), periodo);
  if (!b1 || !b2) throw new ErroHttp(400, 'Selecione dois bairros válidos.');
  if (b1.id === b2.id) throw new ErroHttp(400, 'Selecione dois bairros diferentes.');

  enviarJSON(res, 200, {
    bairro1: b1,
    bairro2: b2,
    // alturas das barras do gráfico (demonstrativas enquanto os valores são "xxx")
    formas: { bairro1: [0.45, 0.85, 0.65, 0.75], bairro2: [0.90, 0.50, 0.90, 0.40] }
  });
}

function info(req, res) {
  const ultima = db.prepare("SELECT valor FROM configuracoes WHERE chave = 'ultima_atualizacao'").get();
  enviarJSON(res, 200, { ultima_atualizacao: ultima ? ultima.valor : 'xxx' });
}

function download(req, res) {
  const colunas = ['nome', 'desemprego', 'empregos_formais', 'informalidade', 'renda_media',
    'desemprego_jovem', 'populacao_ativa', 'participacao_formal', 'variacao'];
  const linhas = db.prepare(`
    SELECT b.nome, i.* FROM bairros b
    JOIN indicadores_bairro i ON i.bairro_id = b.id
    WHERE i.periodo_id = ? ORDER BY b.nome
  `).all(periodoAtualId());

  const csv = [colunas.join(';'), ...linhas.map(l => colunas.map(c => l[c]).join(';'))].join('\n');
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="dadosrecife.csv"'
  });
  res.end('﻿' + csv);
}

module.exports = {
  visaoGeral, listarBairros, detalharBairro, mapa, listarPeriodos, comparar, info, download
};
