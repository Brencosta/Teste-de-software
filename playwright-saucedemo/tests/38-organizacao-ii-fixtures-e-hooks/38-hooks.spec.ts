import { test, expect } from './fixtures/fixtures';
import { usuarios } from './dados/usuarios';

/**
 * AULA 38: Hooks
 *
 * Hooks são funções que rodam automaticamente em momentos da execução:
 *
 *   beforeAll  -> uma vez, antes do PRIMEIRO teste do grupo (por worker)
 *   beforeEach -> antes de CADA teste
 *   (teste)
 *   afterEach  -> depois de CADA teste, mesmo se ele falhar
 *   afterAll   -> uma vez, depois do ÚLTIMO teste do grupo (por worker)
 *
 * Atenção: beforeAll e afterAll NÃO recebem `page`, porque o page é criado
 * por teste. Neles só podemos usar fixtures de worker, como `browser`.
 *
 * Os console.log abaixo existem só para você ver a ordem de execução no
 * terminal. Rode com: npx playwright test tests/38-organizacao-ii-fixtures-e-hooks/38-hooks.spec.ts
 */

// Os testes deste arquivo rodam em sequência (serial) para que a ordem
// dos logs dos hooks fique fácil de acompanhar no terminal.
test.describe.configure({ mode: 'serial' });

test.describe('Aula 38: ciclo de vida com hooks', () => {
  let inicioDaSuite: number;

  test.beforeAll(async ({ browserName }) => {
    // Bom lugar para preparar algo caro e compartilhado: criar massa de dados
    // via API, subir um mock, limpar um banco de testes...
    inicioDaSuite = Date.now();
    console.log(`[beforeAll] iniciando a suíte no ${browserName}`);
  });

  test.beforeEach(async ({ loginPage, inventoryPage }, testInfo) => {
    // Pré-condição comum a todos os testes do grupo: usuário logado.
    // testInfo traz informações sobre o teste atual (título, status, anexos...).
    console.log(`[beforeEach] preparando: ${testInfo.title}`);
    await loginPage.acessar();
    await loginPage.login(usuarios.standard.usuario, usuarios.standard.senha);
    await inventoryPage.validarQueEstaAberta();
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`[afterEach] ${testInfo.title}: ${testInfo.status}`);

    // Exemplo prático: anexar um screenshot ao relatório quando o teste
    // terminar diferente do esperado. O config já faz isso automaticamente,
    // mas aqui mostramos como anexar qualquer evidência sob demanda.
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('tela-no-momento-da-falha', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }

    // Limpeza: em um sistema real, apagaríamos dados criados pelo teste
    // (pedidos, usuários...). O SauceDemo guarda o carrinho no navegador,
    // e cada teste já ganha um navegador limpo, então aqui apenas
    // demonstramos o lugar certo para esse tipo de código.
  });

  test.afterAll(async () => {
    const duracao = ((Date.now() - inicioDaSuite) / 1000).toFixed(1);
    console.log(`[afterAll] suíte finalizada em ${duracao}s`);
  });

  test('o carrinho começa vazio após o login', async ({ inventoryPage }) => {
    await expect(inventoryPage.badgeCarrinho).toBeHidden();
  });

  test('adicionar produto mostra a quantidade no carrinho', async ({ inventoryPage }) => {
    await inventoryPage.adicionarAoCarrinho('Sauce Labs Bolt T-Shirt');
    await expect(inventoryPage.badgeCarrinho).toHaveText('1');
  });

  test('o carrinho do teste anterior não vaza para este teste', async ({ inventoryPage }) => {
    // Prova do isolamento: mesmo com o teste anterior tendo adicionado um
    // produto, aqui o carrinho está vazio, porque cada teste ganha um
    // contexto de navegador novo (e o beforeEach faz um login novo).
    await expect(inventoryPage.badgeCarrinho).toBeHidden();
  });
});
