// Definição dos endpoints da API
const Router = require('./router');
const auth = require('./controllers/authController');
const ind = require('./controllers/indicadoresController');

const router = new Router();

// Autenticação
router.post('/api/login', auth.login, { publica: true });
router.post('/api/cadastro', auth.cadastro, { publica: true });
router.post('/api/logout', auth.logout);
router.get('/api/me', auth.eu);

// Indicadores
router.get('/api/visao-geral', ind.visaoGeral);
router.get('/api/bairros', ind.listarBairros);
router.get('/api/bairros/:id', ind.detalharBairro);
router.get('/api/mapa', ind.mapa);
router.get('/api/periodos', ind.listarPeriodos);
router.get('/api/comparar', ind.comparar);
router.get('/api/info', ind.info);
router.get('/api/download', ind.download);

module.exports = router;
