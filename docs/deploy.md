# Como executar e publicar o DadosRecife

Há três formas de rodar o sistema. Todas usam o mesmo código, a mesma API e o mesmo banco.

## 1. No computador, com Node.js instalado

```bash
npm start
```

Acesse http://techminds.localhost. Se a porta 80 estiver ocupada, o servidor usa a porta 3000 automaticamente (http://techminds.localhost:3000).

## 2. Kit portátil (sem instalar o Node.js)

Para computadores sem Node.js, como os do laboratório:

1. Copie a pasta inteira do projeto para um pendrive, **incluindo a pasta `node/`** (ela tem o `node.exe` e não vai para o GitHub).
2. No outro computador, dê dois cliques em **`INICIAR.bat`**.
3. O navegador abre sozinho. Não feche a janela preta enquanto estiver usando o sistema.

> Se a pasta `node/` não existir (por exemplo, depois de baixar do GitHub), baixe o "Windows Binary (.zip)" em https://nodejs.org, extraia e copie o `node.exe` para uma pasta `node/` na raiz do projeto.

## 3. Publicado na internet (Render)

O arquivo `render.yaml` já tem toda a configuração. Com o código no GitHub:

1. Crie uma conta em https://render.com (pode entrar com a conta do GitHub).
2. Clique em **New → Blueprint**.
3. Escolha o repositório do projeto e confirme.
4. Aguarde o deploy (alguns minutos). O endereço será parecido com `https://techminds-dadosrecife.onrender.com`.

Sempre que um commit novo for enviado ao GitHub, o Render publica a nova versão sozinho.

### Observações do plano gratuito

- Depois de cerca de 15 minutos sem acesso, o servidor "dorme"; o primeiro acesso seguinte leva uns 50 segundos. **Abra o site alguns minutos antes da apresentação.**
- O disco não é permanente: a cada reinício o banco é recriado a partir de `schema.sql` e `seed.sql`. Contas criadas somem, mas o usuário de teste sempre existe.
