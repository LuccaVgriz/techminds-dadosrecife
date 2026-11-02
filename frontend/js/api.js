// Cliente da API REST: guarda o token de sessão e faz as requisições ao back-end
const API = {
  token() {
    return localStorage.getItem('dr_token');
  },

  salvarSessao(token, usuario) {
    localStorage.setItem('dr_token', token);
    localStorage.setItem('dr_usuario', JSON.stringify(usuario));
  },

  limparSessao() {
    localStorage.removeItem('dr_token');
    localStorage.removeItem('dr_usuario');
  },

  async req(metodo, url, corpo) {
    const opcoes = { method: metodo, headers: {} };
    if (this.token()) opcoes.headers.Authorization = 'Bearer ' + this.token();
    if (corpo) {
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(corpo);
    }

    let resp;
    try {
      resp = await fetch(url, opcoes);
    } catch {
      throw new Error('Não foi possível conectar ao servidor.');
    }

    // sessão expirada: volta para o login
    if (resp.status === 401 && !url.endsWith('/login')) {
      this.limparSessao();
      window.location.href = 'login.html';
      throw new Error('Sessão expirada');
    }

    const dados = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(dados.erro || 'Erro na requisição');
    return dados;
  },

  get(url) { return this.req('GET', url); },
  post(url, corpo) { return this.req('POST', url, corpo); },

  async baixarArquivo(url, nome) {
    const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + this.token() } });
    if (!resp.ok) throw new Error('Falha no download');
    const blob = await resp.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nome;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};
