// Protege a página: sem token volta para o login
if (!API.token()) window.location.href = 'login.html';

const $ = (id) => document.getElementById(id);
let bairros = [];
let bairroSelecionadoMapa = null;

// ================= utilidades =================
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('visivel');
  setTimeout(() => t.classList.remove('visivel'), 2500);
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

function desenharMapa(container, lista, aoClicar, idSelecionado) {
  container.innerHTML = '';
  lista.forEach(b => {
    const tile = document.createElement('button');
    tile.className = 'tile f' + b.faixa + (b.id === idSelecionado ? ' sel' : '');
    tile.style.gridColumn = b.grid_col;
    tile.style.gridRow = b.grid_row;
    tile.title = b.nome;
    tile.addEventListener('click', () => aoClicar(b, tile));
    container.appendChild(tile);
  });
}

function desenharLegenda(container, rotulos) {
  container.innerHTML = '<h4>Legenda</h4><ul>' +
    rotulos.map((r, i) => `<li><i class="f${i + 1}"></i>${escapar(r)}</li>`).join('') + '</ul>';
}

// Gráfico de linha em SVG puro ("forma" vai de 0 a 1)
function graficoLinha(svg, pontos, comEixo) {
  const L = 300, A = 140, m = 20;
  const passo = (L - m * 2) / (pontos.length - 1);
  const coords = pontos.map((p, i) => [m + i * passo, A - m - p.forma * (A - m * 2)]);
  let html = '';
  if (comEixo) {
    html += `<line x1="${m}" y1="${m / 2}" x2="${m}" y2="${A - m}" stroke="#c9d3e0"/>
             <line x1="${m}" y1="${A - m}" x2="${L - m / 2}" y2="${A - m}" stroke="#c9d3e0"/>`;
  }
  html += `<polyline points="${coords.map(c => c.join(',')).join(' ')}" fill="none" stroke="#1f6fd1" stroke-width="2.5"/>`;
  if (!comEixo) {
    html += coords.map((c, i) =>
      `<circle cx="${c[0]}" cy="${c[1]}" r="3.5" fill="#1f6fd1"><title>${escapar(pontos[i].rotulo)}: ${escapar(pontos[i].valor)}</title></circle>`
    ).join('');
  }
  svg.innerHTML = html;
}

function graficoBarras(svg, formas1, formas2, rotulos) {
  const L = 300, A = 150, base = 125, largura = 16;
  const grupo = (L - 20) / rotulos.length;
  let html = `<line x1="10" y1="${base}" x2="${L - 10}" y2="${base}" stroke="#c9d3e0"/>`;
  rotulos.forEach((r, i) => {
    const x = 10 + i * grupo + grupo / 2;
    const h1 = formas1[i] * (base - 10), h2 = formas2[i] * (base - 10);
    html += `<rect x="${x - largura - 2}" y="${base - h1}" width="${largura}" height="${h1}" rx="3" fill="#1f6fd1"><title>xxx</title></rect>
             <rect x="${x + 2}" y="${base - h2}" width="${largura}" height="${h2}" rx="3" fill="#1a9e5c"><title>xxx</title></rect>
             <text x="${x}" y="${base + 14}" font-size="8" text-anchor="middle" fill="#5c6b80">${r}</text>`;
  });
  svg.innerHTML = html;
}

// ================= navegação =================
const carregadores = {
  'visao-geral': carregarVisaoGeral,
  'indicadores': carregarIndicadores,
  'mapas': carregarMapa,
  'comparar': carregarComparar,
  'metodologia': carregarMetodologia
};
const carregadas = new Set();

function irPara(pagina) {
  if (!$('pg-' + pagina)) pagina = 'visao-geral';
  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
  $('pg-' + pagina).classList.add('ativa');
  document.querySelectorAll('.menu a').forEach(a =>
    a.classList.toggle('ativo', a.dataset.pagina === pagina));
  if (carregadores[pagina] && !carregadas.has(pagina)) {
    carregadas.add(pagina);
    carregadores[pagina]().catch(err => toast(err.message));
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => irPara(location.hash.slice(1)));

// ================= VISÃO GERAL =================
async function carregarVisaoGeral() {
  const d = await API.get('/api/visao-geral');

  $('kpis').innerHTML = d.kpis.map(k => `
    <div class="card kpi">
      <div class="rotulo">${escapar(k.rotulo)}</div>
      <div class="valor">${k.chave === 'renda' ? 'R$ ' : ''}${escapar(k.valor)}${['desemprego', 'informal'].includes(k.chave) ? '%' : ''}</div>
      <div class="var ${escapar(k.tendencia)}">${k.tendencia === 'alta' ? '↑ ' : k.tendencia === 'baixa' ? '↓ ' : ''}${escapar(k.variacao)}</div>
    </div>`).join('');

  desenharMapa($('mapaVisao'), d.mapa, (b, tile) => {
    document.querySelectorAll('#mapaVisao .tile').forEach(t => t.classList.remove('sel'));
    tile.classList.add('sel');
    $('infoVisao').textContent = `${b.nome} — taxa de desemprego: xxx%`;
  });
  desenharLegenda($('legendaVisao'), d.legenda);
  graficoLinha($('graficoEvolucao'), d.evolucao, false);

  $('tabelaTop5').innerHTML = d.top5.map((b, i) =>
    `<tr><td>${i + 1}</td><td>${escapar(b.nome)}</td><td>${escapar(b.desemprego)}%</td></tr>`).join('');
}

// ================= INDICADORES POR BAIRRO =================
async function carregarIndicadores() {
  await consultarBairro($('indBairro').value);
}

async function consultarBairro(id) {
  if (!id) return;
  const b = await API.get('/api/bairros/' + id);
  $('indNome').textContent = b.nome;
  $('indTituloEvolucao').textContent = 'Evolução dos indicadores — ' + b.nome;
  $('indMini').innerHTML = [
    ['Taxa de desemprego', b.desemprego + '%'],
    ['Empregos formais', b.empregos_formais],
    ['Trabalho informal', b.informalidade + '%'],
    ['Renda média', 'R$ ' + b.renda_media]
  ].map(([r, v]) => `<div class="mini"><div class="rotulo">${r}</div><div class="valor">${escapar(v)}</div></div>`).join('');
  $('indSociais').innerHTML = [
    ['Desemprego jovem', b.desemprego_jovem + '%'],
    ['População ativa', b.populacao_ativa],
    ['Participação formal', b.participacao_formal + '%'],
    ['Variação', b.variacao + '%']
  ].map(([r, v]) => `<li><span>${r}</span><span>${escapar(v)}</span></li>`).join('');
  graficoLinha($('graficoBairro'), b.evolucao, true);
}

$('btnConsultar').addEventListener('click', () =>
  consultarBairro($('indBairro').value).catch(err => toast(err.message)));

// ================= MAPA INTERATIVO =================
async function carregarMapa() {
  const periodos = await API.get('/api/periodos');
  $('mapaPeriodo').innerHTML = periodos.map(p => `<option value="${p.id}">${escapar(p.rotulo)}</option>`).join('');
  await aplicarMapa();
}

async function aplicarMapa() {
  const indicador = $('mapaIndicador').value;
  const periodo = encodeURIComponent($('mapaPeriodo').value);
  const d = await API.get(`/api/mapa?indicador=${indicador}&periodo=${periodo}`);
  $('mapaTitulo').textContent = d.titulo;
  desenharLegenda($('legendaMapa'), d.legenda);
  if (!bairroSelecionadoMapa) bairroSelecionadoMapa = d.bairros[0];
  mostrarBairroMapa(bairroSelecionadoMapa);
  desenharMapa($('mapaInterativo'), d.bairros, (b, tile) => {
    document.querySelectorAll('#mapaInterativo .tile').forEach(t => t.classList.remove('sel'));
    tile.classList.add('sel');
    bairroSelecionadoMapa = b;
    mostrarBairroMapa(b);
  }, bairroSelecionadoMapa && bairroSelecionadoMapa.id);
}

function mostrarBairroMapa(b) {
  if (!b) return;
  $('mapaSelNome').textContent = b.nome;
  $('mapaSelRenda').textContent = b.renda_media;
  $('mapaSelDesemp').textContent = b.desemprego;
}

$('btnAplicar').addEventListener('click', () => aplicarMapa().catch(err => toast(err.message)));
$('btnVerDetalhes').addEventListener('click', () => {
  if (!bairroSelecionadoMapa) return;
  abrirBairro(bairroSelecionadoMapa.id);
});

// ================= COMPARAR =================
async function carregarComparar() {
  await comparar();
}

async function comparar() {
  const b1 = $('compB1').value, b2 = $('compB2').value;
  if (b1 === b2) return toast('Selecione dois bairros diferentes.');
  const d = await API.get(`/api/comparar?b1=${b1}&b2=${b2}`);
  const n1 = d.bairro1.nome, n2 = d.bairro2.nome;
  $('legB1').textContent = $('thB1').textContent = n1;
  $('legB2').textContent = $('thB2').textContent = n2;
  graficoBarras($('graficoComparar'), d.formas.bairro1, d.formas.bairro2,
    ['Desemprego', 'Empregos', 'Informalidade', 'Renda']);
  const linhas = [
    ['Desemprego', 'desemprego', '', '%'],
    ['Empregos formais', 'empregos_formais', '', ''],
    ['Informalidade', 'informalidade', '', '%'],
    ['Renda média', 'renda_media', 'R$ ', '']
  ];
  $('tabelaComparar').innerHTML = linhas.map(([r, c, pre, suf]) =>
    `<tr><td>${r}</td><td>${pre}${escapar(d.bairro1[c])}${suf}</td><td>${pre}${escapar(d.bairro2[c])}${suf}</td></tr>`).join('');
}

$('btnComparar').addEventListener('click', () => comparar().catch(err => toast(err.message)));

// ================= METODOLOGIA =================
async function carregarMetodologia() {
  const d = await API.get('/api/info');
  $('ultimaAtualizacao').textContent = d.ultima_atualizacao;
}

// ================= RELATÓRIOS / DOWNLOAD =================
async function baixarDados() {
  try {
    await API.baixarArquivo('/api/download', 'dadosrecife.csv');
    toast('Download iniciado.');
  } catch (err) {
    toast(err.message);
  }
}

function abrirModal(html) {
  $('modalConteudo').innerHTML = html;
  $('modal').classList.add('aberto');
}
function fecharModal() { $('modal').classList.remove('aberto'); }
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') fecharModal(); });

function opcoesBairros() {
  return bairros.map(b => `<option value="${b.id}">${escapar(b.nome)}</option>`).join('');
}

function modalRelatorioBairro() {
  abrirModal(`
    <h3>Relatório por Bairro</h3>
    <p class="texto-suave">Escolha o bairro para gerar o relatório.</p>
    <div class="campo" style="margin-top:14px"><label>Bairro</label><select id="relBairro">${opcoesBairros()}</select></div>
    <div id="relSaida"></div>
    <div class="acoes">
      <button class="btn-contorno" data-acao="fechar">Fechar</button>
      <button class="btn" data-acao="gerar-bairro">Gerar</button>
    </div>`);
}

async function gerarRelatorioBairro() {
  const b = await API.get('/api/bairros/' + $('relBairro').value);
  $('relSaida').innerHTML = `
    <h3 style="margin-top:12px">${escapar(b.nome)}</h3>
    <table class="tabela-borda" style="margin-top:8px"><tbody>
      <tr><td>Taxa de desemprego</td><td>${escapar(b.desemprego)}%</td></tr>
      <tr><td>Empregos formais</td><td>${escapar(b.empregos_formais)}</td></tr>
      <tr><td>Trabalho informal</td><td>${escapar(b.informalidade)}%</td></tr>
      <tr><td>Renda média</td><td>R$ ${escapar(b.renda_media)}</td></tr>
      <tr><td>Desemprego jovem</td><td>${escapar(b.desemprego_jovem)}%</td></tr>
      <tr><td>População ativa</td><td>${escapar(b.populacao_ativa)}</td></tr>
      <tr><td>Participação formal</td><td>${escapar(b.participacao_formal)}%</td></tr>
    </tbody></table>
    <button class="btn" style="margin-top:12px" data-acao="imprimir">Imprimir / salvar PDF</button>`;
}

function modalRelatorioTematico() {
  abrirModal(`
    <h3>Relatório Temático</h3>
    <p class="texto-suave">Escolha o tema do relatório.</p>
    <div class="campo" style="margin-top:14px"><label>Tema</label>
      <select id="relTema">
        <option value="desemprego">Desemprego</option>
        <option value="renda_media">Renda</option>
        <option value="informalidade">Informalidade</option>
      </select></div>
    <div id="relSaida"></div>
    <div class="acoes">
      <button class="btn-contorno" data-acao="fechar">Fechar</button>
      <button class="btn" data-acao="gerar-tematico">Criar</button>
    </div>`);
}

function gerarRelatorioTematico() {
  const sel = $('relTema');
  const nomeTema = sel.options[sel.selectedIndex].text;
  // os dados completos dos bairros vêm da API
  Promise.all(bairros.map(b => API.get('/api/bairros/' + b.id))).then(lista => {
    $('relSaida').innerHTML = `
      <h3 style="margin-top:12px">${escapar(nomeTema)} por bairro</h3>
      <table class="tabela-borda" style="margin-top:8px">
        <thead><tr><th>Bairro</th><th>${escapar(nomeTema)}</th></tr></thead>
        <tbody>${lista.map(b => `<tr><td>${escapar(b.nome)}</td><td>${escapar(b[sel.value])}</td></tr>`).join('')}</tbody>
      </table>
      <button class="btn" style="margin-top:12px" data-acao="imprimir">Imprimir / salvar PDF</button>`;
  }).catch(err => toast(err.message));
}

// Botões com data-acao (delegação de eventos)
document.addEventListener('click', e => {
  const alvo = e.target.closest('[data-acao]');
  if (!alvo) return;
  const acoes = {
    'download': baixarDados,
    'relatorio-bairro': modalRelatorioBairro,
    'relatorio-tematico': modalRelatorioTematico,
    'gerar-bairro': () => gerarRelatorioBairro().catch(err => toast(err.message)),
    'gerar-tematico': gerarRelatorioTematico,
    'imprimir': () => window.print(),
    'fechar': fecharModal
  };
  if (acoes[alvo.dataset.acao]) acoes[alvo.dataset.acao]();
});

// ================= BUSCA / BAIRRO =================
function abrirBairro(id) {
  $('indBairro').value = id;
  location.hash = 'indicadores';
  carregadas.add('indicadores');
  irPara('indicadores');
  consultarBairro(id).catch(err => toast(err.message));
}

$('formBusca').addEventListener('submit', e => {
  e.preventDefault();
  const termo = $('inputBusca').value.trim().toLowerCase();
  if (!termo) return;
  const achado = bairros.find(b => b.nome.toLowerCase() === termo) ||
                 bairros.find(b => b.nome.toLowerCase().includes(termo));
  if (!achado) return toast('Bairro não encontrado.');
  $('inputBusca').value = '';
  abrirBairro(achado.id);
});
$('inputBusca').addEventListener('change', () => $('formBusca').requestSubmit());

// ================= USUÁRIO =================
$('btnUsuario').addEventListener('click', e => {
  e.stopPropagation();
  $('menuUsuario').classList.toggle('aberto');
});
document.addEventListener('click', () => $('menuUsuario').classList.remove('aberto'));

$('btnSair').addEventListener('click', async () => {
  try { await API.post('/api/logout'); } catch (_) { /* sessão já inválida */ }
  API.limparSessao();
  window.location.href = 'login.html';
});

// ================= INÍCIO =================
async function iniciar() {
  const [usuario, lista] = await Promise.all([API.get('/api/me'), API.get('/api/bairros')]);
  $('nomeUsuario').textContent = usuario.nome;
  $('emailUsuario').textContent = usuario.email;

  bairros = lista;
  document.querySelectorAll('.sel-bairros').forEach(s => s.innerHTML = opcoesBairros());
  if (bairros.length > 1) $('compB2').value = bairros[1].id;
  $('listaBairros').innerHTML = bairros.map(b => `<option value="${escapar(b.nome)}">`).join('');

  irPara(location.hash.slice(1) || 'visao-geral');
}

iniciar().catch(err => toast(err.message));
