# Aula 37: Organização I (Page Object Model)

## Conceito

Nas aulas anteriores, os seletores ficavam espalhados dentro dos testes. Se o SauceDemo mudasse o atributo de um campo, teríamos que corrigir dezenas de arquivos.

O **Page Object Model (POM)** resolve isso criando uma classe para cada tela. Cada classe guarda:

- os **localizadores** da tela;
- as **ações** que o usuário faz nela (`login`, `adicionarAoCarrinho`, `finalizar`...);
- validações reaproveitáveis daquela tela.

O teste fica limpo, sem seletores, e descreve apenas o comportamento esperado.

## Estrutura

```
37-organizacao-i-pom/
  pages/
    LoginPage.ts       tela de login
    InventoryPage.ts   listagem de produtos, ordenação e badge do carrinho
    CartPage.ts        carrinho
    CheckoutPage.ts    informações do comprador, revisão e conclusão
  37-pom-saucedemo.spec.ts
```

## O que os testes demonstram

- Login válido, inválido e de usuário bloqueado.
- Ordenação por preço e por nome.
- Adição e remoção de produtos.
- Compra completa e validação de erro no checkout.

Compare com as aulas 34 e 35: os fluxos são parecidos, mas não há nenhum `getByTestId` ou `locator` no arquivo de teste.

## Como rodar

```bash
npx playwright test tests/37-organizacao-i-pom
# ou
npm run aula:37
```
