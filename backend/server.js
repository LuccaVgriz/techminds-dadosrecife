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

// Se a porta padrão (80) estiver ocupada ou bloqueada, tenta a 3000
servidor.on('error', (erro) => {
  const podeTrocar = !process.env.PORT && servidor.portaAtual === 80;
  if (podeTrocar && (erro.code === 'EADDRINUSE' || erro.code === 'EACCES')) {
    console.log('Porta 80 indisponível, usando a porta 3000...');
    iniciar(3000);
  } else {
    console.error(`Não foi possível iniciar o servidor: ${erro.message}`);
    process.exit(1);
  }
});

servidor.on('listening', () => {
  // No Render, mostra o endereço público do site
  if (process.env.RENDER_EXTERNAL_URL) {
    return console.log(`DadosRecife publicado em ${process.env.RENDER_EXTERNAL_URL}`);
  }

  const porta = servidor.address().port;
  const endereco = `http://techminds.localhost${porta === 80 ? '' : `:${porta}`}`;
  console.log(`DadosRecife rodando em ${endereco}`);
  console.log('Para desligar, feche esta janela ou aperte Ctrl + C.');

  // Usado pelo INICIAR.bat para abrir o navegador automaticamente
  if (process.env.ABRIR_NAVEGADOR && process.platform === 'win32') {
    require('node:child_process').exec(`start "" "${endereco}"`);
  }
});

function iniciar(porta) {
  servidor.portaAtual = porta;
  servidor.listen(porta);
}

iniciar(config.porta);
