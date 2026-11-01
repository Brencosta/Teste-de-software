# Aula 34: Ações do Usuário

## Conceito

Ações simulam o que uma pessoa faz na tela. Antes de cada ação, o Playwright verifica automaticamente se o elemento está visível, estável e habilitado (actionability checks), então não precisamos de esperas manuais.

| Ação | Para que serve |
| ---- | -------------- |
| `fill` | Preenche um campo (limpa e digita de uma vez). |
| `pressSequentially` | Digita tecla por tecla, para páginas que reagem a cada tecla. |
| `click` | Clica no elemento. |
| `press` | Envia uma tecla ou atalho (`Enter`, `ControlOrMeta+A`). |
| `selectOption` | Escolhe uma opção em um `<select>`. |
| `check` / `uncheck` | Marca ou desmarca checkbox e radio de forma segura. |
| `hover` | Passa o mouse sobre o elemento. |
| `goto`, `goBack`, `goForward`, `reload` | Navegação. |

## O que os testes demonstram

- Login apertando Enter.
- Digitação tecla a tecla e atalho para apagar o campo.
- Ordenação de produtos com `selectOption`.
- Hover validado pela mudança de cor do nome do produto.
- `check` e `uncheck` em um HTML montado com `page.setContent` (o SauceDemo não tem checkbox).
- Navegação entre páginas.
- Cenário completo: login, adicionar 3 produtos, remover 2 (um na listagem e outro no carrinho), checkout com dados do comprador e finalização do pedido.

## Como rodar

```bash
npx playwright test tests/34-acoes-do-usuario
# ou
npm run aula:34
```
