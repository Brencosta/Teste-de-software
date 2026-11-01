# Aula 35: Tipos de Asserts

## Conceito

Asserts (verificações) decidem se o teste passou. No Playwright há dois grupos:

**Web-first (com `await`)**: recebem `page` ou um `locator` e esperam a condição ficar verdadeira, tentando de novo até o timeout. Use sempre que validar algo na tela.

| Página | Elemento |
| ------ | -------- |
| `toHaveURL`, `toHaveTitle` | `toBeVisible`, `toBeHidden`, `toBeEnabled`, `toHaveText`, `toContainText`, `toHaveCount`, `toHaveValue`, `toHaveAttribute` |

**Genéricos (sem `await`)**: comparam valores do JavaScript uma única vez: `toBe`, `toEqual`, `toBeGreaterThan`, `toBeLessThan`, `toHaveLength`...

**Soft assertions** (`expect.soft`): registram a falha e deixam o teste continuar. No final, o teste falha listando todos os problemas. O assert comum para o teste no primeiro erro.

## O que os testes demonstram

- Asserts de página e de elemento no login, na listagem e no carrinho.
- Negação com `.not`.
- Validação da ordenação por preço lendo os valores da tela e comparando com `toEqual`, `toBe` e `toBeGreaterThan`.
- Diferença entre `toBe` (referência) e `toEqual` (conteúdo).
- Soft assertions passando e um teste com `test.fail` em que dois soft asserts falham de propósito, mostrando que a execução continua depois do primeiro erro.

## Como rodar

```bash
npx playwright test tests/35-tipos-de-asserts
# ou
npm run aula:35
```
