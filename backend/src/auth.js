// Autenticação: hash de senha (scrypt) e validação do token de sessão
const crypto = require('node:crypto');
const { db } = require('./db');

function hashSenha(senha, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return { hash, salt };
}

function senhaConfere(senha, usuario) {
  const { hash } = hashSenha(senha, usuario.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(usuario.senha_hash, 'hex'));
}

function gerarToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Retorna o usuário dono do token "Authorization: Bearer <token>" ou null
function usuarioDaRequisicao(req) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return null;

  const sessao = db.prepare(`
    SELECT u.id, u.nome, u.email, s.expira_em
    FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token = ?
  `).get(token);
  if (!sessao) return null;

  if (sessao.expira_em < Date.now()) {
    db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
    return null;
  }
  return { id: sessao.id, nome: sessao.nome, email: sessao.email, token };
}

module.exports = { hashSenha, senhaConfere, gerarToken, usuarioDaRequisicao };
