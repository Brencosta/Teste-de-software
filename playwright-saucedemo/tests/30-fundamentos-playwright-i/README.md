# Aula 30: Fundamentos do Playwright I

## Conceito

Primeiro contato com o Playwright Test. Todo teste tem três ingredientes:

- `test`: declara um caso de teste com um nome e uma função.
- `page`: fixture que representa uma aba do navegador, usada para navegar e interagir.
- `expect`: faz as verificações que decidem se o teste passou ou falhou.

Cada teste roda em um contexto de navegador novo e isolado, como uma janela anônima.

## O que os testes demonstram

1. Abrir o SauceDemo e validar o título da página (`Swag Labs`).
2. Fazer login com `standard_user` / `secret_sauce` e confirmar que a página de produtos foi aberta.

## Como rodar

```bash
npx playwright test tests/30-fundamentos-playwright-i
# ou
npm run aula:30
```

Para ver o navegador abrindo durante o teste, acrescente `--headed`.
