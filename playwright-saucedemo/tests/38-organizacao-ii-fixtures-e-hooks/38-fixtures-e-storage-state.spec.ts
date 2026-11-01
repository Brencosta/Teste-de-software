import { test, testLogado, expect } from './fixtures/fixtures';
import { compradorValido } from './dados/usuarios';

/**
 * AULA 38: Fixtures customizadas e storageState
 *
 * Compare com a aula 37:
 * - Lá, cada teste fazia `new LoginPage(page)`, `new InventoryPage(page)`...
 *   Aqui os Page Objects chegam prontos pelos parâmetros do teste.
 * - Lá, o login era repetido em um beforeEach. Aqui, com `testLogado`, o
 *   navegador já abre logado graças ao storageState (veja fixtures/fixtures.ts).
 */

test.describe('Aula 38: Page Objects entregues por fixture', () => {
  test('login válido usando loginPage e inventoryPage da fixture', async ({
    loginPage,
    inventoryPage,
  }) => {
    // Nenhum "new" aqui: a fixture já criou os objetos para nós.
    await loginPage.acessar();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.validarQueEstaAberta();
  });
});

testLogado.describe('Aula 38: usuário já logado com storageState', () => {
  testLogado('acessar a listagem diretamente, sem passar pelo login', async ({ inventoryPage }) => {
    // Vamos direto para /inventory.html. Sem o storageState, o SauceDemo
    // nos mandaria de volta para a tela de login com um erro.
    await inventoryPage.acessar();
    await inventoryPage.validarQueEstaAberta();
  });

  testLogado('fixture usuarioLogado entrega a listagem já aberta', async ({ usuarioLogado }) => {
    // usuarioLogado é um InventoryPage que já navegou e validou a tela.
    // O teste começa direto no que interessa.
    await expect(usuarioLogado.produtos).toHaveCount(6);
  });

  testLogado('compra completa partindo de um usuário logado', async ({
    usuarioLogado,
    cartPage,
    checkoutPage,
  }) => {
    await usuarioLogado.adicionarAoCarrinho('Sauce Labs Fleece Jacket');
    await usuarioLogado.abrirCarrinho();

    await cartPage.validarQueEstaAberto();
    await cartPage.irParaCheckout();

    await checkoutPage.preencherDados(compradorValido);
    await expect(checkoutPage.subtotal).toHaveText('Item total: $49.99');
    await checkoutPage.finalizar();

    await expect(checkoutPage.tituloConclusao).toHaveText('Thank you for your order!');
  });

  testLogado('ordenação por preço do maior para o menor', async ({ usuarioLogado }) => {
    await usuarioLogado.ordenarPor('hilo');
    await expect(usuarioLogado.precosProdutos.first()).toHaveText('$49.99');

    const precos = await usuarioLogado.obterPrecos();
    expect(precos).toEqual([...precos].sort((a, b) => b - a));
  });
});
