import { test, expect } from '@playwright/test';

/**
 * AULA 32: demonstração de screenshot e vídeo em caso de falha.
 *
 * Detalhe importante: para o Playwright, uma falha marcada com test.fail()
 * é o resultado ESPERADO. Com 'only-on-failure' / 'retain-on-failure' (o padrão
 * do nosso config), as evidências desse teste seriam descartadas. Por isso,
 * neste arquivo, ligamos a captura sempre ('on').
 *
 * Por que em um arquivo separado? screenshot e video só podem ser alterados no
 * topo do arquivo (ou no config), porque mudam a forma como o navegador é
 * iniciado. Dentro de um test.describe o Playwright recusa essa configuração.
 */
test.use({ screenshot: 'on', video: 'on' });

// Este teste FALHA DE PROPÓSITO para que você veja o screenshot e o vídeo do
// momento da falha. O test.fail() avisa o Playwright que a falha é esperada:
// ele aparece com ✘ no terminal, mas conta como sucesso e não quebra a suíte.
// As evidências ficam em test-results/ e no relatório HTML
// (npx playwright show-report). Se um dia ele passar, o Playwright acusa erro,
// porque a falha deixou de acontecer.
test('evidências de falha: screenshot e vídeo', { tag: '@didatico' }, async ({ page }) => {
  test.fail(true, 'Falha proposital para demonstrar screenshot e vídeo na falha');

  await page.goto('/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('senha_errada');
  await page.locator('#login-button').click();

  // Esperamos chegar ao inventário, mas a senha está errada: o assert falha.
  // Timeout curto só para a demonstração não demorar.
  await expect(page).toHaveURL('/inventory.html', { timeout: 2000 });
});
