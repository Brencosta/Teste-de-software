import fs from 'node:fs';
import path from 'node:path';
import { test as base, expect, selectors } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { usuarios } from '../dados/usuarios';

/**
 * FIXTURES CUSTOMIZADAS
 *
 * `page` e `request` são fixtures que o Playwright já entrega prontas.
 * Com test.extend criamos as NOSSAS fixtures. Cada fixture tem três partes:
 *
 *   minhaFixture: async ({ outrasFixtures }, use) => {
 *     // 1. preparação (setup): roda ANTES do teste
 *     await use(valor);        // 2. entrega o valor e o teste executa aqui
 *     // 3. limpeza (teardown): roda DEPOIS do teste, mesmo se ele falhar
 *   }
 *
 * Vantagens em relação a beforeEach:
 * - Só roda se o teste PEDIR a fixture (nos parâmetros). Testes que não usam
 *   o checkoutPage não pagam o custo de criá-lo.
 * - Setup e teardown ficam juntos, no mesmo lugar.
 * - Pode ser reaproveitada em qualquer arquivo que importe este `test`.
 */

// Tipos das fixtures por TESTE (criadas de novo para cada teste).
type PaginasFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

// Tipos das fixtures por WORKER (criadas uma vez por processo e reaproveitadas).
type SessaoFixtures = {
  sessaoStandardUser: string;
};

export const test = base.extend<PaginasFixtures, SessaoFixtures>({
  // Page Objects prontos: o teste recebe o objeto já instanciado.
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  /**
   * Faz login UMA vez por worker e salva a sessão em arquivo (storageState).
   *
   * O storageState é um JSON com cookies e localStorage do navegador.
   * O SauceDemo guarda o login no cookie "session-username", então basta
   * carregar esse arquivo em um contexto novo para ele já "nascer" logado,
   * sem passar pela tela de login de novo.
   *
   * { scope: 'worker' } faz a fixture viver durante todo o worker. Usamos um
   * arquivo por worker (parallelIndex) para que workers rodando em paralelo
   * não escrevam no mesmo arquivo ao mesmo tempo.
   */
  sessaoStandardUser: [
    async ({ browser }, use, workerInfo) => {
      const pastaAuth = path.resolve(__dirname, '../../../.auth');
      const arquivo = path.join(pastaAuth, `standard_user-${workerInfo.parallelIndex}.json`);
      fs.mkdirSync(pastaAuth, { recursive: true });

      // Esta fixture pode rodar ANTES de o Playwright aplicar o
      // testIdAttribute do config no worker. Sem esta linha, o getByTestId
      // procuraria data-testid (o padrão) e o login falharia de vez em quando,
      // dependendo da ordem dos testes. Aplicamos o valor do config na mão.
      selectors.setTestIdAttribute(workerInfo.project.use.testIdAttribute ?? 'data-test');

      // Abrimos um contexto separado só para fazer o login. Ele não herda a
      // baseURL do config automaticamente, por isso a repassamos.
      const contexto = await browser.newContext({ baseURL: workerInfo.project.use.baseURL });
      const page = await contexto.newPage();

      // Reaproveitamos o Page Object também aqui: nada de seletor solto.
      const loginPage = new LoginPage(page);
      await loginPage.acessar();
      await loginPage.login(usuarios.standard.usuario, usuarios.standard.senha);
      await new InventoryPage(page).validarQueEstaAberta();

      // Salva cookies e localStorage no arquivo.
      await contexto.storageState({ path: arquivo });
      await contexto.close();

      await use(arquivo);
    },
    { scope: 'worker' },
  ],
});

/**
 * `testLogado` é o mesmo `test` acima, mas todo contexto de navegador já
 * nasce com a sessão do standard_user carregada.
 *
 * `storageState` é uma opção nativa do Playwright (a mesma que poderia ir no
 * playwright.config.ts). Aqui a sobrescrevemos com o arquivo gerado pela
 * fixture de worker. Como a fixture de worker roda uma vez só, os testes
 * seguintes reaproveitam a sessão e ficam mais rápidos.
 */
export const testLogado = test.extend<{ usuarioLogado: InventoryPage }>({
  storageState: async ({ sessaoStandardUser }, use) => {
    await use(sessaoStandardUser);
  },

  // Fixture que entrega a listagem de produtos já aberta e com usuário logado.
  usuarioLogado: async ({ inventoryPage }, use) => {
    await inventoryPage.acessar();
    await inventoryPage.validarQueEstaAberta();
    await use(inventoryPage);
  },
});

// Reexportamos o expect para que os testes importem tudo de um lugar só.
export { expect };
