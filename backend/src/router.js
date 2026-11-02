// Roteador simples: associa "MÉTODO /caminho/:param" a uma função controladora
class Router {
  constructor() {
    this.rotas = [];
  }

  adicionar(metodo, caminho, controlador, { publica = false } = {}) {
    const nomesParams = [];
    const padrao = caminho.replace(/:(\w+)/g, (_, nome) => {
      nomesParams.push(nome);
      return '([^/]+)';
    });
    this.rotas.push({ metodo, regex: new RegExp(`^${padrao}$`), nomesParams, controlador, publica });
  }

  get(caminho, controlador, opcoes) { this.adicionar('GET', caminho, controlador, opcoes); }
  post(caminho, controlador, opcoes) { this.adicionar('POST', caminho, controlador, opcoes); }

  encontrar(metodo, caminho) {
    for (const rota of this.rotas) {
      if (rota.metodo !== metodo) continue;
      const m = caminho.match(rota.regex);
      if (!m) continue;
      const params = {};
      rota.nomesParams.forEach((nome, i) => { params[nome] = decodeURIComponent(m[i + 1]); });
      return { ...rota, params };
    }
    return null;
  }
}

module.exports = Router;
