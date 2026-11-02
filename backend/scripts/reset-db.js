// Recria o banco de dados executando database/schema.sql e database/seed.sql
const { db, recriarBanco } = require('../src/db');

recriarBanco(db);
console.log('Banco de dados recriado com sucesso.');
