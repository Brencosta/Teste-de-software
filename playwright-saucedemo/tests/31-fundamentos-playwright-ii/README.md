# Aula 31: Fundamentos do Playwright II

## Conceito

Saber rodar e depurar testes é tão importante quanto escrevê-los. Esta aula apresenta os modos de execução do Playwright e as ferramentas que ajudam a entender por que um teste falhou.

Os testes (login válido e inválido) são simples de propósito: use-os como cobaia para cada comando abaixo.

## Comandos

Todos os comandos são executados dentro da pasta `playwright-saucedemo/`.

### Execução padrão (headless)

```bash
npx playwright test tests/31-fundamentos-playwright-ii
```

O navegador roda escondido. É o modo mais rápido e o usado em CI.

### Modo headed

```bash
npx playwright test tests/31-fundamentos-playwright-ii --headed
```

Mostra o navegador na tela. Útil para ver o que o teste está fazendo.

### UI mode

```bash
npx playwright test tests/31-fundamentos-playwright-ii --ui
```

Abre uma interface gráfica com a lista de testes, linha do tempo de cada passo, snapshots do DOM e modo "watch" (roda de novo ao salvar o arquivo). É o modo mais confortável para o dia a dia.

### Debug

```bash
npx playwright test tests/31-fundamentos-playwright-ii --debug
```

Abre o Playwright Inspector e pausa antes do primeiro comando. Permite executar passo a passo (Step over), ver qual elemento cada seletor encontra e testar seletores ao vivo.

Também é possível pausar em um ponto específico colocando `await page.pause();` no código (há um exemplo comentado no teste de login inválido).

Para depurar um único teste, informe arquivo e linha:

```bash
npx playwright test tests/31-fundamentos-playwright-ii/31-execucao-e-depuracao.spec.ts:24 --debug
```

### Codegen (gravador de testes)

```bash
npx playwright codegen https://www.saucedemo.com
```

Abre um navegador e grava cada ação sua, gerando código Playwright automaticamente. Ótimo para descobrir seletores, mas o código gerado deve ser revisado e organizado antes de virar teste de verdade (ele não cria asserts significativos sozinho).

### Trace viewer

O trace é uma "gravação" completa do teste: cada ação, screenshots, DOM, console e rede.

```bash
# Força a geração do trace em todos os testes desta execução
npx playwright test tests/31-fundamentos-playwright-ii --trace on

# Abre um trace específico
npx playwright show-trace test-results/<pasta-do-teste>/trace.zip
```

No `playwright.config.ts` o trace está como `retain-on-failure`, ou seja, ele é gerado sempre, mas só fica guardado quando o teste falha. O trace também pode ser aberto arrastando o `trace.zip` para https://trace.playwright.dev.

### Relatório HTML

```bash
npx playwright show-report
# ou
npm run report
```

Após cada execução, o Playwright gera a pasta `playwright-report/`. O relatório mostra todos os testes, tempo, erros, screenshots, vídeos e traces anexados.

## Como rodar apenas esta aula

```bash
npx playwright test tests/31-fundamentos-playwright-ii
# ou
npm run aula:31
```
