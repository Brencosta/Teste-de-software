# Aula 36: Esperas e Asserts

## Conceito

**Auto-wait**: o Playwright espera sozinho. Antes de cada ação, aguarda o elemento ficar pronto. Em cada assert web-first (`await expect(...)`), tenta de novo até a condição ser verdadeira ou o timeout acabar.

**Por que evitar `waitForTimeout`**: uma espera fixa é lenta quando o sistema é rápido e falha quando o sistema é mais lento que o previsto. Sempre espere por uma **condição**, nunca pelo relógio.

| Ferramenta | Quando usar |
| ---------- | ----------- |
| `expect(...).toX({ timeout })` | Validar algo que sabidamente demora mais que o padrão de 5s. |
| `page.waitForURL` | Sincronizar com uma navegação antes da próxima ação. |
| `page.waitForLoadState` | Esperar a página carregar (`domcontentloaded`, `load`, `networkidle`). |
| `page.waitForResponse` | Esperar uma requisição de rede específica. Comece a esperar **antes** da ação que a dispara. |
| `locator.waitFor` | Esperar um elemento ficar visível ou sumir, sem validar nada. |

## O que os testes demonstram

- O `performance_glitch_user`, que demora para logar, tratado com timeout customizado no `expect`.
- Exemplo ruim (comentado, com `waitForTimeout`) ao lado do exemplo correto.
- `waitForURL`, `waitForLoadState`, `waitForResponse` e `locator.waitFor`.
- Um fluxo de carrinho sem nenhuma espera manual, apenas auto-wait.

## Como rodar

```bash
npx playwright test tests/36-esperas-e-asserts
# ou
npm run aula:36
```
