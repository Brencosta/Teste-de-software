import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração central do Playwright para o projeto SauceDemo.
 * Documentação completa: https://playwright.dev/docs/test-configuration
 *
 * Tudo o que está aqui vale para todas as aulas. Quando uma aula precisa de
 * algo diferente (por exemplo, a aula 29 usa outra baseURL para testar API),
 * ela sobrescreve a opção localmente com test.use(), sem mexer neste arquivo.
 */
export default defineConfig({
  // Pasta onde o Playwright procura os arquivos *.spec.ts
  testDir: './tests',

  // Roda os testes de um mesmo arquivo em paralelo. Isso só é seguro porque
  // cada teste é independente (abre seu próprio navegador e faz seu login).
  fullyParallel: true,

  // Em CI, um test.only esquecido no código faz a execução falhar.
  // Assim ninguém sobe para o repositório um código que roda só 1 teste.
  forbidOnly: !!process.env.CI,

  // Retentativas apenas em CI, onde a rede costuma ser mais instável.
  // Localmente queremos ver a falha na primeira vez para investigar.
  retries: process.env.CI ? 2 : 0,

  // Em CI usamos 1 worker para evitar sobrecarregar a máquina compartilhada.
  workers: process.env.CI ? 1 : undefined,

  // 'list' mostra o progresso no terminal e 'html' gera o relatório navegável
  // (abra com: npx playwright show-report). open: 'never' evita abrir o
  // navegador sozinho ao final de cada execução.
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Com baseURL definida, podemos escrever page.goto('/') em vez da URL inteira.
    baseURL: 'https://www.saucedemo.com',

    // O SauceDemo identifica seus elementos com o atributo data-test
    // (e não data-testid, que é o padrão do Playwright). Esta linha faz o
    // getByTestId('username') procurar por [data-test="username"].
    testIdAttribute: 'data-test',

    // Evidências de execução. Os valores abaixo equilibram utilidade e espaço
    // em disco: só guardamos o material quando algo dá errado.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Para rodar em outros navegadores, basta descomentar os blocos abaixo.
    // Lembre de instalar os navegadores antes: npx playwright install
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
