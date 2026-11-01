# Aula 32: Fundamentos do Playwright III

## Conceito

Conforme a suíte cresce, precisamos organizar e escolher o que rodar:

- `test.describe`: agrupa testes relacionados.
- `test.only`: roda somente os testes marcados (útil durante o desenvolvimento, nunca deve ser commitado).
- `test.skip`: pula um teste, deixando registrado o motivo.
- `test.fail`: marca uma falha esperada (o teste "passa" quando falha).
- Tags (`@smoke`, `@regressao`): rótulos para filtrar a execução.
- Screenshot e vídeo em caso de falha: evidências para investigar problemas.

## O que os testes demonstram

- Um `describe` de Login e outro de Carrinho.
- Tag em teste individual (`{ tag: '@smoke' }`), múltiplas tags e tag herdada pelo `describe`.
- Um teste pulado com `test.skip` e um skip condicional por navegador.
- Um teste com `test.fail` que falha de propósito para gerar screenshot e vídeo (arquivo `32-evidencias-de-falha.spec.ts`).

## Executando por tag

```bash
# Somente testes @smoke
npx playwright test tests/32-fundamentos-playwright-iii --grep @smoke

# Somente testes @regressao
npx playwright test tests/32-fundamentos-playwright-iii --grep @regressao

# Tudo, exceto @didatico
npx playwright test tests/32-fundamentos-playwright-iii --grep-invert @didatico

# @smoke OU @negativo (expressão regular)
npx playwright test tests/32-fundamentos-playwright-iii --grep "@smoke|@negativo"
```

Atalhos no `package.json` (rodam o projeto inteiro): `npm run test:smoke` e `npm run test:regressao`.

## Screenshot e vídeo

Configurados no `playwright.config.ts` e repetidos no arquivo com `test.use`:

```ts
test.use({ screenshot: 'only-on-failure', video: 'retain-on-failure' });
```

Após rodar a aula, abra o relatório (`npx playwright show-report`) e clique no teste "evidências de falha" para ver o screenshot e o vídeo anexados.

Atenção: como esse teste usa `test.fail` (falha esperada), o Playwright o considera "passou" e descartaria as evidências no modo `only-on-failure`. Por isso, no arquivo `32-evidencias-de-falha.spec.ts`, a captura está ligada sempre (`screenshot: 'on'`, `video: 'on'`). Essas opções só podem ser alteradas no topo do arquivo ou no config, nunca dentro de um `describe`, e é por isso que a demonstração tem um arquivo próprio.

## Como rodar

```bash
npx playwright test tests/32-fundamentos-playwright-iii
# ou
npm run aula:32
```
