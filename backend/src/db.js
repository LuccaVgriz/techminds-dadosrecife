// Conexão com o banco SQLite (módulo nativo node:sqlite)
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const PASTA_SQL = path.join(__dirname, '..', '..', 'database');

function executarScript(db, arquivo) {
  db.exec(fs.readFileSync(path.join(PASTA_SQL, arquivo), 'utf8'));
}

// Recria o banco do zero a partir dos scripts SQL
function recriarBanco(db) {
  executarScript(db, 'schema.sql');
  executarScript(db, 'seed.sql');
}

const bancoNovo = !fs.existsSync(config.arquivoBanco);
const db = new DatabaseSync(config.arquivoBanco);
db.exec('PRAGMA foreign_keys = ON;');

if (bancoNovo) {
  recriarBanco(db);
  console.log('Banco de dados criado a partir de database/schema.sql e database/seed.sql');
}

module.exports = { db, recriarBanco };
