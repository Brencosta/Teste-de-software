# Aula 33: Localizadores

## Conceito

Localizadores dizem ao Playwright **como encontrar** um elemento. A escolha do localizador define se o teste será fácil de ler e se vai sobreviver a mudanças no layout.

Ordem de preferência (boa prática recomendada pelo Playwright):

| Prioridade | Localizador | Quando usar |
| ---------- | ----------- | ----------- |
| 1 | `getByRole` | Sempre que possível. Reflete como o usuário e os leitores de tela enxergam a página. |
| 2 | `getByText`, `getByPlaceholder`, `getByLabel` | Textos visíveis ao usuário. |
| 3 | `getByTestId` | Quando não há texto ou papel estável. O SauceDemo usa `data-test`, por isso o config tem `testIdAttribute: 'data-test'`. |
| 4 | CSS (`locator('#id')`) | Último recurso, depende de detalhes de implementação. |
| 5 | XPath | Evitar. Seletores longos e frágeis. |

## O que os testes demonstram

`33-localizadores-login.spec.ts`

- O mesmo login feito com `getByRole`, `getByPlaceholder`, `getByTestId`, CSS e XPath.
- `getByText` para validar mensagem de erro.

`33-localizadores-produtos.spec.ts`

- Contagem de elementos com `toHaveCount`.
- Encadeamento (buscar um elemento dentro de outro).
- `filter({ hasText })` e `filter({ has })` para achar o produto certo na lista.
- `nth`, `first` e `last` para escolher pela posição.
- Comparação lado a lado de quatro seletores para o mesmo botão.

Dica: use `npx playwright codegen https://www.saucedemo.com` e o botão "Pick locator" para ver qual localizador o Playwright sugere para cada elemento.

## Como rodar

```bash
npx playwright test tests/33-localizadores
# ou
npm run aula:33
```
