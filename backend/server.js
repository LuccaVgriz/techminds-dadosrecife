// Ponto de entrada: servidor HTTP que entrega o front-end e a API REST
const http = require('node:http');
const config = require('./src/config');
const router = require('./src/routes');
const { usuarioDaRequisicao } = require('./src/auth');
const { ErroHttp, enviarJSON, servirArquivo } = require('./src/http');

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Qualquer caminho fora de /api é arquivo do front-end
  if (!url.pathname.startsWith('/api/')) {
    return servirArquivo(res, config.pastaFrontend, url.pathname);
  }

  try {
    const rota = router.encontrar(req.method, url.pathname);
    if (!rota) throw new ErroHttp(404, 'Rota não encontrada.');

    let usuario = null;
    if (!rota.publica) {
      usuario = usuarioDaRequisicao(req);
      if (!usuario) throw new ErroHttp(401, 'Sessão inválida ou expirada.');
    }

    await rota.controlador(req, res, { usuario, params: rota.params, query: url.searchParams });
  } catch (erro) {
    if (erro instanceof ErroHttp) return enviarJSON(res, erro.status, { erro: erro.message });
    console.error(erro);
    enviarJSON(res, 500, { erro: 'Erro interno do servidor.' });
  } finally {
    console.log(`${req.method} ${url.pathname} -> ${res.statusCode}`);
  }
});

servidor.listen(config.porta, () => {
  const porta = config.porta === 80 ? '' : `:${config.porta}`;
  console.log(`DadosRecife rodando em http://techminds.localhost${porta}`);
});
