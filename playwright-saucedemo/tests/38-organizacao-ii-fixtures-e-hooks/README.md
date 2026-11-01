# Aula 38: Organização II (Fixtures e Hooks)

## Conceito

Evolução da aula 37. Os Page Objects continuam os mesmos (copiados para `pages/` para manter a aula independente), mas agora:

**Hooks** rodam código em momentos fixos da execução:

| Hook | Quando roda | Uso típico |
| ---- | ----------- | ---------- |
| `beforeAll` | uma vez, antes do primeiro teste do grupo | preparar dados caros e compartilhados |
| `beforeEach` | antes de cada teste | pré-condição comum (ex.: login) |
| `afterEach` | depois de cada teste, mesmo com falha | limpeza, anexar evidências |
| `afterAll` | uma vez, depois do último teste do grupo | liberar recursos, relatórios |

**Fixtures customizadas** (`test.extend`) entregam objetos prontos para o teste. Ficam em `fixtures/fixtures.ts`:

- `loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`: Page Objects já instanciados.
- `sessaoStandardUser` (escopo de worker): faz login uma vez e salva a sessão em `.auth/` com `storageState`.
- `testLogado`: variação do `test` em que o navegador já nasce logado.
- `usuarioLogado`: entrega a listagem de produtos já aberta.

**storageState** salva cookies e localStorage em um arquivo JSON. Carregar esse arquivo em um novo contexto reaproveita a sessão sem repetir o login pela tela. A pasta `.auth/` está no `.gitignore`, porque contém cookies de sessão.

**Massa de dados** (`dados/usuarios.ts`) separa os dados do código. Os testes data-driven percorrem a massa com um `for`, gerando um teste para cada item.

## Estrutura

```
38-organizacao-ii-fixtures-e-hooks/
  dados/usuarios.ts                    usuários do SauceDemo e cenários de checkout
  fixtures/fixtures.ts                 test.extend com Page Objects e sessão logada
  pages/                               Page Objects (cópia da aula 37)
  38-hooks.spec.ts                     beforeAll, beforeEach, afterEach, afterAll
  38-fixtures-e-storage-state.spec.ts  fixtures e reaproveitamento de sessão
  38-data-driven.spec.ts               login com os 6 usuários e validações do checkout
```

## O que os testes demonstram

- A ordem de execução dos hooks (veja os logs no terminal).
- Isolamento entre testes: o carrinho de um teste não aparece no seguinte.
- Testes recebendo Page Objects pelos parâmetros, sem `new`.
- Acesso direto a páginas internas com a sessão carregada pelo `storageState`.
- Login data-driven com `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user` e `visual_user`.
- Validações do checkout data-driven (nome, sobrenome e CEP obrigatórios).

## Como rodar

```bash
npx playwright test tests/38-organizacao-ii-fixtures-e-hooks
# ou
npm run aula:38
```

Para ver os logs dos hooks:

```bash
npx playwright test tests/38-organizacao-ii-fixtures-e-hooks/38-hooks.spec.ts
```
