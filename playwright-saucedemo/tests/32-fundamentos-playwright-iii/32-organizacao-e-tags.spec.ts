import { test, expect } from '@playwright/test';

/**
 * AULA 32: Fundamentos do Playwright III
 *
 * Organização básica dos testes:
 * - test.describe agrupa testes relacionados (aparece como "pasta" no relatório).
 * - test.only / test.skip controlam quais testes rodam.
 * - Tags (@smoke, @regressao) permitem rodar subconjuntos pela linha de comando.
 * - Screenshot e vídeo em caso de falha ajudam a investigar o que deu errado.
 */

// Screenshot e vídeo já estão ligados no playwright.config.ts para o projeto todo.
// Repetimos aqui com test.use para mostrar que é possível configurar por arquivo
// (ou por describe). Opções disponíveis:
// - screenshot: 'off' | 'on' | 'only-on-failure'
// - video: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
// Guardar evidências só na falha economiza disco e deixa o relatório limpo.
test.use({ screenshot: 'only-on-failure', video: 'retain-on-failure' });

test.describe('Login', () => {
  // A tag pode ser declarada no objeto de detalhes { tag: ... }.
  // @smoke marca os testes mais críticos: se eles falham, nem vale rodar o resto.
  test('login com usuário válido', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL('/inventory.html');
  });

  // Um teste pode ter mais de uma tag.
  test(
    'login com usuário bloqueado exibe erro',
    { tag: ['@regressao', '@negativo'] },
    async ({ page }) => {
      await page.goto('/');
      await page.locator('#user-name').fill('locked_out_user');
      await page.locator('#password').fill('secret_sauce');
      await page.locator('#login-button').click();

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Sorry, this user has been locked out',
      );
    },
  );

  // test.only faz o Playwright rodar SOMENTE os testes marcados com .only.
  // É ótimo para focar em um teste enquanto você o escreve, mas nunca deve
  // ser commitado: por isso está comentado, e o config usa forbidOnly em CI.
  //
  // test.only('apenas este teste rodaria', async ({ page }) => { ... });
});

test.describe('Carrinho', { tag: '@regressao' }, () => {
  // A tag no describe é herdada por todos os testes dentro dele.

  test('adicionar produto mostra badge com 1 item', async ({ page }) => {
    await page.goto('/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  // test.skip pula o teste. Usamos quando uma funcionalidade ainda não existe
  // ou tem um bug conhecido, deixando registrado o motivo em vez de apagar o teste.
  test.skip('finalizar compra com cupom de desconto', async () => {
    // O SauceDemo não tem cupom de desconto. O teste fica pulado e aparece
    // como "skipped" no relatório, servindo de lembrete.
  });

  // Também é possível pular de forma condicional, por exemplo, só em um navegador.
  test('remover produto do carrinho', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Exemplo de skip condicional por navegador');

    await page.goto('/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
  });
});

// A demonstração de screenshot e vídeo em um teste que falha de propósito
// está no arquivo 32-evidencias-de-falha.spec.ts, nesta mesma pasta.
