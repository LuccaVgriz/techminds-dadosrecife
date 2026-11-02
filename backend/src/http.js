// Funções utilitárias de HTTP: respostas JSON, leitura do corpo e arquivos estáticos
const fs = require('node:fs');
const path = require('node:path');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Erro com status HTTP, tratado pelo servidor
class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function enviarJSON(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dados));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', parte => {
      corpo += parte;
      if (corpo.length > 1e6) reject(new ErroHttp(413, 'Requisição muito grande.'));
    });
    req.on('end', () => {
      try { resolve(corpo ? JSON.parse(corpo) : {}); }
      catch { reject(new ErroHttp(400, 'JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

function servirArquivo(res, pastaBase, caminhoUrl) {
  if (caminhoUrl === '/') caminhoUrl = '/login.html';
  const arquivo = path.normalize(path.join(pastaBase, decodeURIComponent(caminhoUrl)));
  if (!arquivo.startsWith(pastaBase)) {
    res.writeHead(403);
    return res.end('Acesso negado');
  }
  fs.readFile(arquivo, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404);
      return res.end('Não encontrado');
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream',
      'Cache-Control': 'no-cache' // sempre valida a versão mais nova dos arquivos
    });
    res.end(conteudo);
  });
}

module.exports = { ErroHttp, enviarJSON, lerCorpo, servirArquivo };
