# Playwright + SauceDemo

Material de apoio do curso de **Teste de Software**: testes automatizados com [Playwright](https://playwright.dev) e TypeScript, usando o [SauceDemo](https://www.saucedemo.com) como sistema alvo.

## Objetivo

Ensinar automação de testes de forma progressiva. Cada aula tem sua própria pasta, numerada na ordem do curso, com testes comentados em português explicando o **porquê** de cada trecho. As aulas são independentes: cada pasta roda sozinha, sem depender de arquivos de outra.

## Pré-requisitos

- [Node.js](https://nodejs.org) LTS (versão 20 ou superior)
- Git

## Instalação

```bash
git clone https://github.com/Brencosta/Teste-de-software.git
cd Teste-de-software/playwright-saucedemo

npm install
npx playwright install chromium
```

Para rodar também no Firefox e no WebKit, descomente os projetos no `playwright.config.ts` e instale os navegadores com `npx playwright install`.

## Como rodar

```bash
# Todos os testes
npm test

# Com o navegador visível
npm run test:headed

# Interface gráfica (UI mode)
npm run test:ui

# Apenas testes com a tag @smoke ou @regressao
npm run test:smoke
npm run test:regressao

# Abrir o relatório HTML da última execução
npm run report
```

## Como rodar por aula

```bash
npm run aula:33
# é o mesmo que:
npx playwright test tests/33-localizadores
```

Existe um script `aula:NN` para cada aula, de 29 a 38.

## Aulas

| Aula | Pasta | Conteúdo |
| ---- | ----- | -------- |
| 29 | `tests/29-fundamentos-apis-ii` | Testes de API com o fixture `request` (GET, POST, PUT, PATCH, DELETE) no JSONPlaceholder. |
| 30 | `tests/30-fundamentos-playwright-i` | Primeiro teste: estrutura com `test`, `expect` e `page`, título da página e login simples. |
| 31 | `tests/31-fundamentos-playwright-ii` | Execução e depuração: headed, UI mode, debug, codegen, trace viewer e relatório HTML. |
| 32 | `tests/32-fundamentos-playwright-iii` | `describe`, `only`, `skip`, tags e screenshot e vídeo em caso de falha. |
| 33 | `tests/33-localizadores` | `getByRole`, `getByText`, `getByPlaceholder`, `getByTestId`, CSS, XPath, `filter` e `nth`. |
| 34 | `tests/34-acoes-do-usuario` | `fill`, `click`, `selectOption`, `check`, `hover`, `press`, navegação e fluxo completo de compra. |
| 35 | `tests/35-tipos-de-asserts` | Asserts de página, de elemento e genéricos, além de soft assertions. |
| 36 | `tests/36-esperas-e-asserts` | Auto-wait, por que evitar `waitForTimeout` e esperas por URL, carregamento e rede. |
| 37 | `tests/37-organizacao-i-pom` | Page Object Model com `LoginPage`, `InventoryPage`, `CartPage` e `CheckoutPage`. |
| 38 | `tests/38-organizacao-ii-fixtures-e-hooks` | Hooks, fixtures customizadas, `storageState` e testes data-driven. |

Cada pasta tem um `README.md` com o conceito da aula, o que os testes demonstram e como rodá-la.

## Testes que falham de propósito

Alguns testes falham intencionalmente para fins didáticos e estão marcados com `test.fail`. O Playwright os considera aprovados enquanto a falha acontecer (eles aparecem com ✘ no terminal, mas não quebram a execução):

- Aula 32: demonstra screenshot e vídeo gerados na falha.
- Aula 35: demonstra que o soft assertion não interrompe o teste.

Também há um teste com `test.skip` na aula 32, para mostrar como pular um cenário.

## Estrutura do projeto

```
playwright-saucedemo/
  playwright.config.ts   configuração (baseURL, testIdAttribute, evidências, navegadores)
  package.json           dependências e scripts por aula
  tests/
    29-fundamentos-apis-ii/
    ...
    38-organizacao-ii-fixtures-e-hooks/
```

Pastas geradas na execução e ignoradas pelo Git: `node_modules/`, `test-results/`, `playwright-report/` e `.auth/`.
