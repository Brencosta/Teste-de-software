// Tudo o que precisamos para escrever um teste vem do pacote @playwright/test:
// - `test`: função que declara um caso de teste.
// - `expect`: função que faz as verificações (asserts).
import { test, expect } from '@playwright/test';

/**
 * AULA 30: Fundamentos do Playwright I
 *
 * Como o teste é executado:
 * 1. Rodamos `npx playwright test` no terminal.
 * 2. O Playwright lê o playwright.config.ts e encontra todos os arquivos *.spec.ts.
 * 3. Para cada `test(...)`, ele abre um navegador com um contexto NOVO e limpo
 *    (como uma aba anônima), executa a função e fecha tudo no final.
 *    Por isso um teste nunca "herda" login, cookies ou carrinho de outro.
 * 4. Se algum `expect` falhar, o teste para naquele ponto e é marcado como falho.
 *
 * O que é o `page`?
 * É um "fixture": um objeto que o Playwright cria e entrega pronto para o teste.
 * Ele representa UMA aba do navegador. Com ele navegamos (goto), encontramos
 * elementos (locator, getByRole...) e interagimos (click, fill...).
 * Recebemos o page desestruturando o parâmetro: async ({ page }) => { ... }
 */

test('deve abrir o SauceDemo e exibir o título Swag Labs', async ({ page }) => {
  // goto('/') usa a baseURL do config, então vira https://www.saucedemo.com/
  // Todo comando do Playwright é assíncrono (conversa com o navegador),
  // por isso usamos `await` em cada linha. Esquecer o await é o erro nº 1 de iniciantes.
  await page.goto('/');

  // toHaveTitle confere o texto da aba do navegador (a tag <title> do HTML).
  await expect(page).toHaveTitle('Swag Labs');
});

test('deve fazer login com standard_user e chegar na página de produtos', async ({ page }) => {
  await page.goto('/');

  // Preenchemos os campos. O seletor '#user-name' significa "elemento com id user-name".
  // Na aula 33 veremos formas melhores de localizar elementos; por enquanto, id já resolve.
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Validamos o RESULTADO do login, não apenas que o clique aconteceu.
  // Um teste sem expect só prova que nada explodiu, não que o sistema funcionou.
  await expect(page).toHaveURL('/inventory.html');
  await expect(page.locator('.title')).toHaveText('Products');
});
