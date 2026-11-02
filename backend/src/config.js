// Configurações da aplicação (podem ser alteradas por variáveis de ambiente)
const path = require('node:path');

module.exports = {
  porta: Number(process.env.PORT) || 80,
  arquivoBanco: process.env.DB_FILE || path.join(__dirname, '..', 'dadosrecife.db'),
  pastaFrontend: path.join(__dirname, '..', '..', 'frontend'),
  duracaoSessaoMs: 8 * 60 * 60 * 1000 // 8 horas
};
