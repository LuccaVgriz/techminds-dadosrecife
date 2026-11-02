// Se já estiver logado, vai direto para o painel
if (API.token()) window.location.href = 'app.html';

const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');

document.getElementById('irCadastro').addEventListener('click', () => {
  formLogin.hidden = true;
  formCadastro.hidden = false;
});
document.getElementById('irLogin').addEventListener('click', () => {
  formCadastro.hidden = true;
  formLogin.hidden = false;
});

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = document.getElementById('erroLogin');
  const botao = document.getElementById('btnEntrar');
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  erro.textContent = '';
  erro.classList.remove('ok-msg');
  if (!email || !senha) {
    erro.textContent = 'Informe e-mail e senha.';
    return;
  }

  botao.disabled = true;
  botao.textContent = 'Entrando...';
  try {
    const dados = await API.post('/api/login', { email, senha });
    API.salvarSessao(dados.token, dados.usuario);
    window.location.href = 'app.html';
  } catch (err) {
    erro.textContent = err.message;
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = document.getElementById('erroCadastro');
  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;

  erro.textContent = '';
  try {
    await API.post('/api/cadastro', { nome, email, senha });
    formCadastro.reset();
    formCadastro.hidden = true;
    formLogin.hidden = false;
    document.getElementById('email').value = email;
    const msg = document.getElementById('erroLogin');
    msg.textContent = 'Conta criada! Faça login.';
    msg.classList.add('ok-msg');
  } catch (err) {
    erro.textContent = err.message;
  }
});
