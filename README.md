# DadosRecife – TechMinds

Plataforma web para consulta de indicadores de **mercado de trabalho e renda** por bairro do Recife.

- **Front-end:** HTML, CSS e JavaScript puro
- **Back-end:** Node.js (API REST, só módulos nativos)
- **Banco de dados:** SQLite

## Requisitos

- [Node.js](https://nodejs.org) **22.13 ou mais novo** (não precisa de `npm install`)

## Como rodar

```bash
npm start
```

Acesse **http://techminds.localhost** (ou http://localhost).

> A porta padrão é a 80. Para usar outra: `PORT=3000 npm start` (Git Bash) ou `$env:PORT=3000; npm start` (PowerShell).

Login de teste: `gestor@dadosrecife.com` / `123456` — também é possível criar uma conta na tela de login.

## Banco de dados

| Arquivo | Conteúdo |
|---|---|
| [`database/schema.sql`](database/schema.sql) | Script de criação (DDL) |
| [`database/seed.sql`](database/seed.sql) | Script de inserção de dados |
| [`database/modelo-logico.md`](database/modelo-logico.md) | Diagrama ER e modelo lógico |

O banco (`backend/dadosrecife.db`) é criado automaticamente na primeira execução. Para recriá-lo do zero:

```bash
npm run db:reset
```

## Documentação

- [Arquitetura da solução e endpoints da API](docs/arquitetura.md)

## Estrutura

```
backend/    servidor Node.js e API REST
database/   scripts SQL e modelagem
frontend/   telas (HTML, CSS, JS)
docs/       documentação técnica
```

> Os números exibidos (`xxx`) são demonstrativos e devem ser substituídos por dados oficiais na versão final.
