import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

/**
 * AULA 37: Organização I (Page Object Model)
 *
 * Compare este arquivo com as aulas 34 e 35: os fluxos são os mesmos, mas
 * aqui NÃO há nenhum seletor no teste. Todo "como encontrar" ficou dentro
 * das classes em ./pages, e o teste descreve apenas "o que" o usuário faz.
 *
 * Resultado:
 * - O teste lê quase como um caso de teste escrito em português.
 * - Se um seletor mudar, corrigimos em um único arquivo da pasta pages/.
 */

test.describe('Aula 37: login com Page Object', () => {
  test('login válido deve abrir a listagem de produtos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.acessar();
    await loginPage.login('standard_user', 'secret_sauce');

    await inventoryPage.validarQueEstaAberta();
  });

  test('login com senha inválida deve exibir erro', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.login('standard_user', 'senha_errada');

    await loginPage.validarMensagemDeErro('Username and password do not match');
  });

  test('usuário bloqueado não deve conseguir entrar', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await loginPage.validarMensagemDeErro('Sorry, this user has been locked out');
  });
});

test.describe('Aula 37: produtos e carrinho com Page Object', () => {
  // Ainda repetimos o login em cada teste. Na aula 38 isso vira uma fixture.
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.acessar();
    await loginPage.login('standard_user', 'secret_sauce');
    await new InventoryPage(page).validarQueEstaAberta();
  });

  test('ordenação por preço do menor para o maior', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.ordenarPor('lohi');
    // Assert web-first para garantir que a tela já foi reordenada antes de ler.
    await expect(inventoryPage.precosProdutos.first()).toHaveText('$7.99');

    const precos = await inventoryPage.obterPrecos();
    expect(precos).toEqual([...precos].sort((a, b) => a - b));
  });

  test('ordenação por nome de Z para A', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.ordenarPor('za');
    await expect(inventoryPage.nomesProdutos.first()).toHaveText('Test.allTheThings() T-Shirt (Red)');

    const nomes = await inventoryPage.obterNomes();
    expect(nomes).toEqual([...nomes].sort().reverse());
  });

  test('adicionar e remover produtos atualiza o badge do carrinho', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.adicionarAoCarrinho('Sauce Labs Backpack');
    await inventoryPage.adicionarAoCarrinho('Sauce Labs Fleece Jacket');
    await expect(inventoryPage.badgeCarrinho).toHaveText('2');

    await inventoryPage.removerDoCarrinho('Sauce Labs Backpack');
    await expect(inventoryPage.badgeCarrinho).toHaveText('1');
  });

  test('compra completa de dois produtos', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.adicionarAoCarrinho('Sauce Labs Backpack');
    await inventoryPage.adicionarAoCarrinho('Sauce Labs Bike Light');
    await inventoryPage.abrirCarrinho();

    await cartPage.validarQueEstaAberto();
    await expect(cartPage.itens).toHaveCount(2);
    await cartPage.irParaCheckout();

    await checkoutPage.preencherDados({ nome: 'Maria', sobrenome: 'Silva', cep: '01001-000' });
    // 29.99 + 9.99 = 39.98
    await expect(checkoutPage.subtotal).toHaveText('Item total: $39.98');
    await checkoutPage.finalizar();

    await expect(checkoutPage.tituloConclusao).toHaveText('Thank you for your order!');
  });

  test('checkout sem CEP deve exibir erro', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.adicionarAoCarrinho('Sauce Labs Onesie');
    await inventoryPage.abrirCarrinho();
    await cartPage.irParaCheckout();

    await checkoutPage.preencherDados({ nome: 'Maria', sobrenome: 'Silva', cep: '' });

    await expect(checkoutPage.mensagemErro).toHaveText('Error: Postal Code is required');
  });
});
