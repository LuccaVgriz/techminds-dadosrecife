// Endpoints de autenticação: login, cadastro, logout e usuário atual
const { db } = require('../db');
const config = require('../config');
const { hashSenha, senhaConfere, gerarToken } = require('../auth');
const { ErroHttp, enviarJSON, lerCorpo } = require('../http');

async function login(req, res) {
  const { email, senha } = await lerCorpo(req);
  if (!email || !senha) throw new ErroHttp(400, 'Informe e-mail e senha.');

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?')
    .get(String(email).trim().toLowerCase());
  if (!usuario || !senhaConfere(String(senha), usuario)) {
    throw new ErroHttp(401, 'E-mail ou senha incorretos.');
  }

  const token = gerarToken();
  db.prepare('INSERT INTO sessoes (token, usuario_id, expira_em) VALUES (?, ?, ?)')
    .run(token, usuario.id, Date.now() + config.duracaoSessaoMs);

  enviarJSON(res, 200, { token, usuario: { nome: usuario.nome, email: usuario.email } });
}

async function cadastro(req, res) {
  const { nome, email, senha } = await lerCorpo(req);
  if (!nome || !email || !senha) throw new ErroHttp(400, 'Preencha todos os campos.');
  if (String(senha).length < 6) throw new ErroHttp(400, 'A senha deve ter ao menos 6 caracteres.');

  const emailNorm = String(email).trim().toLowerCase();
  if (db.prepare('SELECT id FROM usuarios WHERE email = ?').get(emailNorm)) {
    throw new ErroHttp(409, 'Este e-mail já está cadastrado.');
  }

  const { hash, salt } = hashSenha(String(senha));
  db.prepare('INSERT INTO usuarios (nome, email, senha_hash, salt) VALUES (?, ?, ?, ?)')
    .run(String(nome).trim(), emailNorm, hash, salt);

  enviarJSON(res, 201, { mensagem: 'Conta criada com sucesso.' });
}

function logout(req, res, { usuario }) {
  db.prepare('DELETE FROM sessoes WHERE token = ?').run(usuario.token);
  enviarJSON(res, 200, { mensagem: 'Sessão encerrada.' });
}

function eu(req, res, { usuario }) {
  enviarJSON(res, 200, { nome: usuario.nome, email: usuario.email });
}

module.exports = { login, cadastro, logout, eu };
