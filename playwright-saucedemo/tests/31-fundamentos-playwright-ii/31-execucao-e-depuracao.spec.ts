import { test, expect } from '@playwright/test';

/**
 * AULA 31: Fundamentos do Playwright II
 *
 * Os testes desta aula são propositalmente simples. O foco é aprender a
 * EXECUTAR e DEPURAR testes (veja o README.md desta pasta com todos os comandos).
 *
 * Sugestão de exercício: rode este arquivo com --headed, depois com --ui,
 * depois com --debug, e compare a experiência de cada modo.
 */

test('login válido deve levar para a página de produtos', async ({ page }) => {
  await page.goto('/');

  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  await expect(page).toHaveURL('/inventory.html');
  await expect(page.locator('.title')).toHaveText('Products');
});

test('login com senha inválida deve exibir mensagem de erro', async ({ page }) => {
  await page.goto('/');

  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('senha_errada');

  // Experimente descomentar a linha abaixo e rodar SEM --debug:
  // a execução pausa aqui e abre o Playwright Inspector, permitindo
  // avançar passo a passo e testar seletores na hora.
  // await page.pause();

  await page.locator('#login-button').click();

  // Em um teste negativo validamos que o sistema BARROU a ação
  // e que avisou o usuário com a mensagem correta.
  await expect(page.locator('[data-test="error"]')).toHaveText(
    'Epic sadface: Username and password do not match any user in this service',
  );
  // E que continuamos na tela de login (não houve redirecionamento).
  await expect(page).toHaveURL('/');
});
