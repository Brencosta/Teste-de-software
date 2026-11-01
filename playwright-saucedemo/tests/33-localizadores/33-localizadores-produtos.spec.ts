import { test, expect } from '@playwright/test';

/**
 * AULA 33: Localizadores (listagem de produtos)
 *
 * Em uma lista, vários elementos são parecidos: todos os produtos têm um
 * botão "Add to cart". Para pegar o botão CERTO, combinamos localizadores:
 * - encadeamento: procurar um elemento DENTRO de outro;
 * - filter: restringir uma lista pelo texto ou por um elemento filho;
 * - nth / first / last: escolher pela posição.
 */

test.describe('Aula 33: encadeamento, filter e nth na listagem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/inventory.html');
  });

  test('a listagem deve exibir 6 produtos', async ({ page }) => {
    // Um locator pode representar VÁRIOS elementos. toHaveCount conta todos.
    const produtos = page.getByTestId('inventory-item');
    await expect(produtos).toHaveCount(6);
  });

  test('encadeamento: localizar o preço dentro de um produto', async ({ page }) => {
    // Primeiro achamos o "cartão" do produto, depois buscamos DENTRO dele.
    // Isso evita pegar o preço de outro produto por engano.
    const mochila = page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Backpack' });

    await expect(mochila.getByTestId('inventory-item-price')).toHaveText('$29.99');
  });

  test('filter por texto: adicionar um produto específico ao carrinho', async ({ page }) => {
    // Boa prática: localizar o botão pelo papel e nome DENTRO do produto
    // filtrado. Se a ordem dos produtos mudar, o teste continua correto,
    // porque não depende da posição e sim do nome do produto.
    await page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Bike Light' })
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  test('filter com has: produto que contém um elemento específico', async ({ page }) => {
    // `has` filtra pelos elementos que CONTÊM outro locator.
    // Aqui: o produto que contém o preço $7.99 (o mais barato).
    const produtoBarato = page.getByTestId('inventory-item').filter({
      has: page.getByText('$7.99', { exact: true }),
    });

    await expect(produtoBarato.getByTestId('inventory-item-name')).toHaveText(
      'Sauce Labs Onesie',
    );
  });

  test('nth, first e last: escolher produto pela posição', async ({ page }) => {
    const nomes = page.getByTestId('inventory-item-name');

    // nth começa em 0, como os arrays em JavaScript.
    // Use posição só quando a ordem FAZ PARTE do que está sendo testado
    // (ex.: ordenação). Caso contrário, prefira filter por texto.
    await expect(nomes.first()).toHaveText('Sauce Labs Backpack');
    await expect(nomes.nth(1)).toHaveText('Sauce Labs Bike Light');
    await expect(nomes.last()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });

  test('comparação: o mesmo botão com seletores diferentes', async ({ page }) => {
    // Todos os locators abaixo apontam para o MESMO botão.
    // Comparar ajuda a entender por que preferimos uns aos outros.

    // Recomendado: lê como uma frase e não depende da estrutura do HTML.
    const porRoleEFilter = page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .getByRole('button', { name: 'Add to cart' });

    // Bom: estável, mas não diz nada sobre o que o usuário vê.
    const porTestId = page.getByTestId('add-to-cart-sauce-labs-backpack');

    // Aceitável: depende do id, que pode mudar.
    const porCss = page.locator('#add-to-cart-sauce-labs-backpack');

    // Evitar: frágil, quebra se um <div> for adicionado no meio do caminho.
    const porXPath = page.locator(
      '//div[text()="Sauce Labs Backpack"]/ancestor::div[@class="inventory_item"]//button',
    );

    // Provamos que todos encontram exatamente um elemento, e o mesmo texto.
    for (const botao of [porRoleEFilter, porTestId, porCss, porXPath]) {
      await expect(botao).toHaveCount(1);
      await expect(botao).toHaveText('Add to cart');
    }

    await porRoleEFilter.click();
    // Depois do clique o botão vira "Remove". Como os locators são
    // reavaliados a cada uso, o de testId (que tinha o id "add-to-cart...")
    // não encontra mais nada: o botão agora se chama "remove-sauce-labs-backpack".
    await expect(porTestId).toHaveCount(0);
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
  });
});
