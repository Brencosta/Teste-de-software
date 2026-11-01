import { test, expect, type Page } from '@playwright/test';

/**
 * AULA 34: Ações do Usuário
 *
 * As ações simulam o que uma pessoa faz na tela: digitar, clicar, escolher em
 * uma lista, passar o mouse, apertar teclas e navegar entre páginas.
 *
 * Antes de cada ação o Playwright faz verificações automáticas (actionability):
 * o elemento precisa existir, estar visível, estável (sem animação), habilitado
 * e apto a receber o evento. Por isso não precisamos de "esperas" manuais.
 */

test.describe('Aula 34: ações do usuário no SauceDemo', () => {
  test('fill e press: login apertando Enter em vez de clicar', async ({ page }) => {
    await page.goto('/');

    // fill limpa o campo e digita o texto de uma vez. É a forma preferida
    // de preencher inputs porque é rápida e confiável.
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    // press envia uma tecla para o elemento. Muitos usuários fazem login
    // apertando Enter, então vale testar esse caminho também.
    await page.getByPlaceholder('Password').press('Enter');

    await expect(page).toHaveURL('/inventory.html');
  });

  test('pressSequentially: digitar tecla por tecla', async ({ page }) => {
    await page.goto('/');

    // pressSequentially digita um caractere por vez, disparando os eventos
    // de teclado de cada tecla. Use quando a página reage a cada tecla
    // (ex.: busca com autocomplete). Para o resto, fill é melhor.
    await page.getByPlaceholder('Username').pressSequentially('standard_user', { delay: 20 });
    await expect(page.getByPlaceholder('Username')).toHaveValue('standard_user');

    // Atalhos de teclado também funcionam: seleciona tudo e apaga.
    // ControlOrMeta vira Ctrl no Windows/Linux e Cmd no macOS.
    await page.getByPlaceholder('Username').press('ControlOrMeta+A');
    await page.getByPlaceholder('Username').press('Backspace');
    await expect(page.getByPlaceholder('Username')).toHaveValue('');
  });

  test('selectOption: ordenar produtos por preço', async ({ page }) => {
    await fazerLogin(page);

    // selectOption escolhe uma opção de um <select>. Podemos informar o
    // value ('lohi') ou o texto visível ({ label: 'Price (low to high)' }).
    // O texto é mais próximo do usuário; o value é mais estável.
    await page.getByTestId('product-sort-container').selectOption({ label: 'Price (low to high)' });
    await expect(page.getByTestId('inventory-item-price').first()).toHaveText('$7.99');

    await page.getByTestId('product-sort-container').selectOption('hilo');
    await expect(page.getByTestId('inventory-item-price').first()).toHaveText('$49.99');
  });

  test('hover: passar o mouse sobre o nome do produto', async ({ page }) => {
    await fazerLogin(page);

    const nomeProduto = page.getByTestId('inventory-item-name').first();

    // No SauceDemo o nome do produto muda de cor quando o mouse passa por cima.
    // Validamos a cor antes e depois para provar que o hover aconteceu.
    await expect(nomeProduto).toHaveCSS('color', 'rgb(24, 88, 58)');
    await nomeProduto.hover();
    await expect(nomeProduto).toHaveCSS('color', 'rgb(61, 220, 145)');
  });

  test('check e uncheck: marcar caixas de seleção', async ({ page }) => {
    // O SauceDemo não tem checkbox. Para não deixar a ação de fora, montamos
    // um HTML mínimo com page.setContent. É uma técnica útil para estudar
    // um comportamento isolado sem depender de um site externo.
    await page.setContent(`
      <label><input type="checkbox" id="termos"> Aceito os termos</label>
      <label><input type="checkbox" id="newsletter" checked> Receber novidades</label>
    `);

    const termos = page.getByRole('checkbox', { name: 'Aceito os termos' });
    const newsletter = page.getByRole('checkbox', { name: 'Receber novidades' });

    // check só marca (se já estiver marcado, não faz nada). Diferente de click,
    // que inverteria o estado. Por isso check/uncheck são mais seguros.
    await termos.check();
    await newsletter.uncheck();

    await expect(termos).toBeChecked();
    await expect(newsletter).not.toBeChecked();
  });

  test('navegação: goto, goBack, goForward e reload', async ({ page }) => {
    await fazerLogin(page);

    // Clicar no nome do produto abre a página de detalhes.
    await page.getByText('Sauce Labs Backpack').click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);

    // goBack e goForward equivalem aos botões voltar/avançar do navegador.
    await page.goBack();
    await expect(page).toHaveURL('/inventory.html');
    await page.goForward();
    await expect(page).toHaveURL(/inventory-item\.html/);

    // reload recarrega a página. O usuário continua logado porque a sessão
    // fica salva em um cookie.
    await page.reload();
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

    // goto acessa uma URL diretamente, como digitar na barra de endereço.
    await page.goto('/cart.html');
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
  });

  test('cenário completo: carrinho, remoção e checkout', async ({ page }) => {
    // 1) Login
    await fazerLogin(page);

    // 2) Adicionar três produtos ao carrinho
    for (const produto of ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie']) {
      await page
        .getByTestId('inventory-item')
        .filter({ hasText: produto })
        .getByRole('button', { name: 'Add to cart' })
        .click();
    }
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('3');

    // 3) Remover um produto ainda na listagem
    await page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Onesie' })
      .getByRole('button', { name: 'Remove' })
      .click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    // 4) Ir ao carrinho e remover mais um, agora de dentro do carrinho
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL('/cart.html');
    await page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Bike Light' })
      .getByRole('button', { name: 'Remove' })
      .click();
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);

    // 5) Checkout: preencher os dados do comprador
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByPlaceholder('First Name').fill('Maria');
    await page.getByPlaceholder('Last Name').fill('Silva');
    await page.getByPlaceholder('Zip/Postal Code').fill('01001-000');
    await page.getByRole('button', { name: 'Continue' }).click();

    // 6) Revisão do pedido e finalização
    await expect(page).toHaveURL('/checkout-step-two.html');
    await expect(page.getByTestId('subtotal-label')).toHaveText('Item total: $29.99');
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  });
});

/**
 * Função auxiliar para não repetir o login em todos os testes.
 * É o primeiro passo rumo à organização que veremos nas aulas 37 e 38
 * (Page Object Model e fixtures).
 */
async function fazerLogin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/inventory.html');
}
