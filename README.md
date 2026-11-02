# DadosRecife – TechMinds

Plataforma web para consulta de indicadores de **mercado de trabalho e renda** por bairro do Recife.

- **Front-end:** HTML, CSS e JavaScript puro
- **Back-end:** Node.js (API REST, só módulos nativos)
- **Banco de dados:** SQLite

## Equipe Tech Minds

Disciplina: Coding · Turma: 2NMB · Desafio: Observatório de Emprego e Renda do Recife

| Integrante | Matrícula |
|---|---|
| João Pedro da Silva | 01890017 |
| Hugo Leonardo Ferreira da Silva | 01901371 |
| Maria Eduarda de Araújo Feliciano | 01939384 |
| Lucca Viana Griz de Goes Cavalcanti | 01943007 |

## Requisitos

- [Node.js](https://nodejs.org) **22.13 ou mais novo** (não precisa de `npm install`)

## Como rodar

```bash
npm start
```

Acesse **http://techminds.localhost** (ou http://localhost).

> A porta padrão é a 80; se estiver ocupada, o servidor usa a 3000 automaticamente. Para escolher outra: `$env:PORT=4000; npm start` (PowerShell).

**Sem Node.js instalado?** Dê dois cliques em `INICIAR.bat` (precisa da pasta `node/` com o `node.exe`). **Publicar na internet:** veja [docs/deploy.md](docs/deploy.md).

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
- [Documentação do projeto – AV2 (Word)](docs/Documentacao-AV2-TechMinds.docx)

## Estrutura

```
backend/    servidor Node.js e API REST
database/   scripts SQL e modelagem
frontend/   telas (HTML, CSS, JS)
docs/       documentação técnica
```

> Os números exibidos (`xxx`) são demonstrativos e devem ser substituídos por dados oficiais na versão final.
