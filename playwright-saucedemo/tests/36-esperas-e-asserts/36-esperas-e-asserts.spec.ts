import { test, expect } from '@playwright/test';

/**
 * AULA 36: Esperas e Asserts
 *
 * AUTO-WAIT
 * O Playwright espera sozinho em dois momentos:
 * - Antes de uma AÇÃO (click, fill...): aguarda o elemento ficar visível,
 *   estável e habilitado.
 * - Em um ASSERT web-first (await expect(...)): tenta de novo até a condição
 *   ser verdadeira ou o timeout acabar (5s por padrão).
 *
 * POR QUE EVITAR waitForTimeout (espera fixa)?
 * - Se a página demorar MAIS que o tempo fixo, o teste falha (teste instável).
 * - Se demorar MENOS, o teste fica parado à toa (teste lento).
 * - Em uma suíte com centenas de testes, isso soma minutos de espera inútil.
 * A espera correta é esperar por uma CONDIÇÃO (URL, elemento, resposta), não pelo relógio.
 *
 * O performance_glitch_user do SauceDemo demora alguns segundos para logar,
 * simulando um sistema lento. É perfeito para estudar esperas reais.
 */

const USUARIO_LENTO = 'performance_glitch_user';
const SENHA = 'secret_sauce';

test.describe('Aula 36: esperas com o usuário lento', () => {
  test('exemplo RUIM x CORRETO: esperar o login do usuário lento', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(USUARIO_LENTO);
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();

    // ------------------------------------------------------------------
    // RUIM (não faça isso):
    //
    // await page.waitForTimeout(10000);
    // expect(page.url()).toContain('inventory');
    //
    // Problemas: espera SEMPRE 10s, mesmo se o login levar 1s. E se um dia
    // levar 11s, falha. Além disso, page.url() é lido uma única vez.
    // ------------------------------------------------------------------

    // CORRETO: assert web-first com timeout customizado.
    // Ele verifica a URL repetidamente e segue assim que ela muda.
    // Aumentamos o timeout SÓ neste assert, porque sabemos que esse usuário é
    // lento; os outros asserts continuam com o padrão de 5s.
    await expect(page).toHaveURL('/inventory.html', { timeout: 15_000 });

    // Pegadinha real deste usuário: a URL muda ANTES de a página de produtos
    // terminar de aparecer. Ou seja, "a URL mudou" não garante "a tela está pronta".
    // Por isso este assert também precisa de um timeout maior. Com o padrão de
    // 5s ele falhava com "element(s) not found", mesmo com a URL já correta.
    await expect(page.getByTestId('title')).toHaveText('Products', { timeout: 15_000 });
  });

  test('waitForURL: esperar a navegação terminar', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(USUARIO_LENTO);
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();

    // waitForURL é uma espera (não um assert): pausa até a URL bater com o
    // padrão. Útil quando a próxima AÇÃO depende de estar na nova página.
    // O ** no início aceita qualquer domínio antes de /inventory.html.
    await page.waitForURL('**/inventory.html', { timeout: 15_000 });

    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  test('waitForLoadState: esperar a página carregar recursos', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(USUARIO_LENTO);
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();
    await page.waitForURL('**/inventory.html', { timeout: 15_000 });

    // Estados possíveis:
    // - 'domcontentloaded': HTML lido e montado;
    // - 'load': HTML + imagens, estilos e scripts carregados (padrão);
    // - 'networkidle': nenhuma requisição de rede por 500ms.
    // Aqui esperamos 'load' para garantir que as imagens dos produtos chegaram.
    // Evite 'networkidle' em sites com requisições constantes (chat, analytics):
    // ele pode nunca acontecer.
    await page.waitForLoadState('load');

    // Validamos que a imagem do primeiro produto realmente carregou:
    // naturalWidth > 0 significa que o navegador recebeu e desenhou a imagem.
    const larguraImagem = await page
      .getByRole('img', { name: 'Sauce Labs Backpack' })
      .evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(larguraImagem).toBeGreaterThan(0);
  });

  test('waitForResponse: esperar uma requisição de rede específica', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill(SENHA);

    // IMPORTANTE: começamos a "escutar" a resposta ANTES da ação que a dispara.
    // Se fizermos o click primeiro, a resposta pode chegar antes de começarmos
    // a esperar, e o teste ficaria travado até o timeout.
    // Por isso guardamos a Promise sem await e só aguardamos depois do click.
    const respostaImagem = page.waitForResponse(
      (resposta) => resposta.url().includes('sauce-backpack') && resposta.status() === 200,
    );

    await page.getByTestId('login-button').click();

    // Agora sim aguardamos: a imagem da mochila foi baixada com sucesso.
    const resposta = await respostaImagem;
    expect(resposta.headers()['content-type']).toContain('image');
  });
});

test.describe('Aula 36: auto-wait em ações e asserts', () => {
  test('nenhuma espera manual é necessária no fluxo do carrinho', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();

    // Repare: não há nenhum wait neste teste. Cada click espera o botão
    // ficar pronto, e cada expect espera a tela refletir a mudança.
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

    // RUIM:
    // const texto = await page.getByTestId('shopping-cart-badge').textContent();
    // expect(texto).toBe('1');
    // Lê o texto UMA vez; se a tela ainda não atualizou, falha.

    // CORRETO: o assert web-first tenta de novo até o badge mostrar "1".
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

    await page.getByTestId('remove-sauce-labs-backpack').click();
    // Esperar algo SUMIR também é uma espera por condição.
    await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
  });

  test('locator.waitFor: esperar um elemento sem fazer assert', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(USUARIO_LENTO);
    await page.getByTestId('password').fill(SENHA);
    await page.getByTestId('login-button').click();

    // waitFor espera o elemento atingir um estado ('visible', 'hidden',
    // 'attached', 'detached'). Prefira expect quando quiser VALIDAR algo;
    // use waitFor quando só precisar sincronizar antes de outro passo.
    await page.getByTestId('inventory-list').waitFor({ state: 'visible', timeout: 15_000 });

    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
  });
});
