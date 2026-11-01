import { test, expect, type Page } from '@playwright/test';

/**
 * AULA 35: Tipos de Asserts
 *
 * Existem dois grupos de asserts no Playwright:
 *
 * 1. Asserts "web-first" (com await): recebem um Page ou Locator e ESPERAM
 *    a condição ficar verdadeira, tentando de novo até o timeout (5s padrão).
 *    Ex.: await expect(page).toHaveURL(...), await expect(locator).toBeVisible()
 *
 * 2. Asserts genéricos (sem await): comparam valores comuns do JavaScript
 *    (números, textos, arrays) uma única vez, na hora.
 *    Ex.: expect(soma).toBe(10), expect(lista).toEqual([...])
 *
 * Regra prática: para validar algo NA TELA, use sempre o grupo 1.
 * Ler um texto com textContent() e depois comparar com toBe() é frágil,
 * porque lê o valor uma vez só, talvez antes da página terminar de atualizar.
 */

async function fazerLogin(page: Page) {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
}

/** Converte textos como "$29.99" em números (29.99) para podermos compará-los. */
function precoParaNumero(texto: string): number {
  return Number(texto.replace('$', ''));
}

test.describe('Aula 35: asserts de página', () => {
  test('toHaveURL e toHaveTitle', async ({ page }) => {
    await fazerLogin(page);

    // toHaveURL aceita texto exato (com baseURL) ou expressão regular.
    await expect(page).toHaveURL('/inventory.html');
    await expect(page).toHaveURL(/inventory/);

    // toHaveTitle valida o texto da aba do navegador.
    await expect(page).toHaveTitle('Swag Labs');
  });
});

test.describe('Aula 35: asserts de elemento', () => {
  test('toBeVisible, toBeHidden e toBeEnabled na tela de login', async ({ page }) => {
    await page.goto('/');

    const botaoLogin = page.getByTestId('login-button');
    const mensagemErro = page.getByTestId('error');

    await expect(botaoLogin).toBeVisible();
    // toBeEnabled garante que o usuário consegue clicar (não está desabilitado).
    await expect(botaoLogin).toBeEnabled();
    // toBeHidden passa se o elemento não existe OU existe mas está invisível.
    // Antes de tentar logar, não deve haver mensagem de erro.
    await expect(mensagemErro).toBeHidden();

    await botaoLogin.click();
    await expect(mensagemErro).toBeVisible();
  });

  test('toHaveText e toContainText', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('login-button').click();

    const mensagemErro = page.getByTestId('error');

    // toHaveText exige o texto COMPLETO (ignora espaços nas pontas).
    await expect(mensagemErro).toHaveText('Epic sadface: Username is required');
    // toContainText aceita só um TRECHO. Útil quando parte do texto é dinâmica
    // ou quando só um pedaço importa para o teste.
    await expect(mensagemErro).toContainText('Username is required');
  });

  test('toHaveValue e toHaveAttribute nos campos do formulário', async ({ page }) => {
    await page.goto('/');

    const campoSenha = page.getByTestId('password');
    await campoSenha.fill('secret_sauce');

    // toHaveValue lê o valor atual de um input (o que foi digitado).
    await expect(campoSenha).toHaveValue('secret_sauce');

    // toHaveAttribute valida atributos do HTML. Aqui garantimos que o campo
    // é do tipo password, ou seja, a senha aparece mascarada para o usuário.
    // Isso é um requisito de segurança, não só de aparência.
    await expect(campoSenha).toHaveAttribute('type', 'password');
    await expect(campoSenha).toHaveAttribute('placeholder', 'Password');
  });

  test('toHaveCount no carrinho', async ({ page }) => {
    await fazerLogin(page);

    await expect(page.getByTestId('inventory-item')).toHaveCount(6);

    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('add-to-cart-sauce-labs-bolt-t-shirt').click();
    await page.getByTestId('shopping-cart-link').click();

    await expect(page.getByTestId('inventory-item')).toHaveCount(2);
  });

  test('negação com .not', async ({ page }) => {
    await fazerLogin(page);

    // Qualquer assert pode ser invertido com .not.
    // Carrinho vazio: o badge com a quantidade não deve aparecer.
    await expect(page.getByTestId('shopping-cart-badge')).not.toBeVisible();
    await expect(page).not.toHaveURL('/');
  });
});

test.describe('Aula 35: asserts genéricos', () => {
  test('ordenação por preço (menor para maior) deve estar correta', async ({ page }) => {
    await fazerLogin(page);
    await page.getByTestId('product-sort-container').selectOption('lohi');

    // Garantimos com um assert web-first que a tela JÁ foi reordenada antes de
    // ler os valores. Sem isso, poderíamos ler a lista antiga.
    await expect(page.getByTestId('inventory-item-price').first()).toHaveText('$7.99');

    // allTextContents devolve um array de strings com o texto de cada elemento.
    const textos = await page.getByTestId('inventory-item-price').allTextContents();
    const precos = textos.map(precoParaNumero);

    // Criamos uma cópia ordenada e comparamos com a lista da tela.
    // toEqual compara o CONTEÚDO de arrays e objetos.
    // ([...precos] cria uma cópia para não alterar o array original.)
    const precosOrdenados = [...precos].sort((a, b) => a - b);
    expect(precos).toEqual(precosOrdenados);

    // toBe compara valores simples (número, texto, booleano) com igualdade estrita.
    expect(precos.length).toBe(6);
    expect(precos[0]).toBe(7.99);

    // toBeGreaterThan / toBeLessThan comparam números.
    expect(precos[precos.length - 1]).toBeGreaterThan(precos[0]);
  });

  test('ordenação por preço (maior para menor) deve estar correta', async ({ page }) => {
    await fazerLogin(page);
    await page.getByTestId('product-sort-container').selectOption('hilo');
    await expect(page.getByTestId('inventory-item-price').first()).toHaveText('$49.99');

    const precos = (await page.getByTestId('inventory-item-price').allTextContents()).map(
      precoParaNumero,
    );

    // Validação item a item: cada preço deve ser maior ou igual ao próximo.
    for (let i = 0; i < precos.length - 1; i++) {
      expect(precos[i]).toBeGreaterThanOrEqual(precos[i + 1]);
    }
  });

  test('toBe vs toEqual: diferença na comparação de objetos', async () => {
    const produtoA = { nome: 'Sauce Labs Backpack', preco: 29.99 };
    const produtoB = { nome: 'Sauce Labs Backpack', preco: 29.99 };

    // toEqual compara o conteúdo: os dois objetos têm os mesmos campos e valores.
    expect(produtoA).toEqual(produtoB);

    // toBe compara a REFERÊNCIA: são dois objetos diferentes na memória,
    // mesmo com conteúdo igual. Por isso usamos .not aqui.
    expect(produtoA).not.toBe(produtoB);
  });
});

test.describe('Aula 35: soft assertions', () => {
  test('soft assertions passando: todas as verificações do cabeçalho', async ({ page }) => {
    await fazerLogin(page);

    // expect.soft NÃO interrompe o teste quando falha: ele registra o erro e
    // continua executando. No final, se algum soft falhou, o teste é marcado
    // como falho, listando TODOS os problemas encontrados de uma vez.
    // Útil para validar vários itens independentes de uma mesma tela.
    await expect.soft(page.getByTestId('title')).toHaveText('Products');
    await expect.soft(page.getByTestId('shopping-cart-link')).toBeVisible();
    await expect.soft(page.getByTestId('product-sort-container')).toBeEnabled();
    await expect.soft(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  });

  // Este teste FALHA DE PROPÓSITO (por isso o test.fail) para mostrar a
  // diferença entre o assert comum e o soft.
  // Rode e abra o relatório (npx playwright show-report): você verá DOIS erros
  // listados, porque o soft não parou a execução no primeiro.
  test('soft assertions falhando: o teste continua após o erro', async ({ page }) => {
    test.fail(true, 'Falha proposital para mostrar que o soft assert não interrompe o teste');

    await fazerLogin(page);

    // Erro 1 (proposital): o título é "Products", não "Produtos".
    await expect.soft(page.getByTestId('title')).toHaveText('Produtos', { timeout: 1000 });

    // Esta linha EXECUTA mesmo com o erro acima. Com um expect comum,
    // o teste teria parado na linha anterior e nunca chegaria aqui.
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

    // Erro 2 (proposital): o badge mostra "1", não "2".
    await expect.soft(page.getByTestId('shopping-cart-badge')).toHaveText('2', { timeout: 1000 });

    // test.info().errors guarda os erros dos soft asserts até aqui.
    // Usamos um expect comum para provar que os dois foram registrados.
    expect(test.info().errors).toHaveLength(2);
  });
});
