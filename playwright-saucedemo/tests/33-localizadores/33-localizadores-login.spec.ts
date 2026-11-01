import { test, expect } from '@playwright/test';

/**
 * AULA 33: Localizadores (tela de login)
 *
 * Um localizador (locator) é a "receita" para encontrar um elemento na página.
 * Ele não busca o elemento na hora em que é criado: a busca acontece só quando
 * usamos o locator (click, fill, expect...). Isso permite que o Playwright
 * espere o elemento aparecer e evita erros com elementos que mudam na tela.
 *
 * Ordem de preferência recomendada pela documentação do Playwright:
 * 1. getByRole        -> como um usuário (e um leitor de tela) enxerga a página
 * 2. getByLabel / getByPlaceholder / getByText -> textos visíveis ao usuário
 * 3. getByTestId      -> atributo criado para teste, estável, mas invisível ao usuário
 * 4. CSS / XPath      -> último recurso: dependem da estrutura interna do HTML
 *
 * Neste arquivo fazemos o MESMO login várias vezes, cada vez com um tipo de
 * localizador, para comparar a legibilidade e a robustez de cada um.
 */

const USUARIO = 'standard_user';
const SENHA = 'secret_sauce';

test.describe('Aula 33: comparando localizadores no login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login usando getByRole', async ({ page }) => {
    // getByRole procura pelo PAPEL do elemento (textbox, button, link...) e pelo
    // nome acessível dele. É a melhor prática porque:
    // - reflete como o usuário interage (ele vê "um botão Login", não um id);
    // - quebra se a acessibilidade da página piorar, o que é um bug real.
    // Os campos do SauceDemo têm aria-label, que vira o nome acessível.
    await page.getByRole('textbox', { name: 'Username' }).fill(USUARIO);
    await page.getByRole('textbox', { name: 'Password' }).fill(SENHA);
    // O botão é um <input type="submit" value="Login">: o value vira o nome.
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Products')).toBeVisible();
  });

  test('login usando getByPlaceholder', async ({ page }) => {
    // getByPlaceholder usa o texto de dica que aparece dentro do campo vazio.
    // Bom quando o campo não tem label, mas o placeholder pode mudar com
    // tradução ou ajustes de UX, então é um pouco menos estável que o role.
    await page.getByPlaceholder('Username').fill(USUARIO);
    await page.getByPlaceholder('Password').fill(SENHA);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/inventory.html');
  });

  test('login usando getByTestId (data-test)', async ({ page }) => {
    // getByTestId procura pelo atributo de teste. O padrão do Playwright é
    // data-testid, mas o SauceDemo usa data-test. Por isso configuramos
    // testIdAttribute: 'data-test' no playwright.config.ts.
    // Vantagem: o time de desenvolvimento cria esse atributo justamente para
    // os testes, então ele não muda quando o layout ou o texto mudam.
    // Desvantagem: o usuário não enxerga esse atributo, então o teste não
    // garante nada sobre como a página aparece para ele.
    await page.getByTestId('username').fill(USUARIO);
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();

    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('login usando seletores CSS', async ({ page }) => {
    // CSS é rápido e conhecido por quem já mexeu com front-end:
    // '#id', '.classe', '[atributo="valor"]', 'tag'.
    // Problema: depende de detalhes de implementação. Se o dev renomear a
    // classe ou o id, o teste quebra mesmo com a tela funcionando igual.
    await page.locator('#user-name').fill(USUARIO);
    await page.locator('input[name="password"]').fill(SENHA);
    await page.locator('.submit-button').click();

    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('login usando XPath', async ({ page }) => {
    // XPath permite navegar livremente pela árvore do HTML (pai, irmão, texto).
    // É poderoso, mas costuma gerar seletores longos, difíceis de ler e muito
    // frágeis. Use só quando nenhuma outra opção resolver.
    // O Playwright reconhece automaticamente que um seletor começando com //
    // é XPath, mas o prefixo "xpath=" deixa isso explícito.
    await page.locator('xpath=//input[@id="user-name"]').fill(USUARIO);
    await page.locator('//input[@placeholder="Password"]').fill(SENHA);
    await page.locator('//input[@type="submit"]').click();

    await expect(page.locator('//span[@class="title"]')).toHaveText('Products');
  });

  test('getByText para localizar a mensagem de erro', async ({ page }) => {
    await page.getByTestId('username').fill(USUARIO);
    await page.getByTestId('password').fill('senha_errada');
    await page.getByTestId('login-button').click();

    // getByText encontra um elemento pelo texto visível. Ideal para mensagens,
    // títulos e textos que o usuário lê. Por padrão aceita trecho do texto e
    // ignora maiúsculas/minúsculas; com { exact: true } exige o texto idêntico.
    await expect(page.getByText('Username and password do not match')).toBeVisible();
  });
});
