import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object da tela de login.
 *
 * Um Page Object concentra em UM lugar tudo o que sabemos sobre uma tela:
 * - os localizadores (onde estão os elementos);
 * - as ações que o usuário faz nela (fazer login).
 *
 * Vantagem: se o SauceDemo mudar o seletor do campo de usuário, corrigimos
 * só aqui, e todos os testes que fazem login voltam a funcionar.
 */
export class LoginPage {
  // `readonly` impede que alguém troque o locator por engano depois de criado.
  readonly page: Page;
  readonly campoUsuario: Locator;
  readonly campoSenha: Locator;
  readonly botaoLogin: Locator;
  readonly mensagemErro: Locator;

  constructor(page: Page) {
    this.page = page;
    // Criar locators no construtor é seguro: eles só buscam o elemento
    // quando são usados, não neste momento.
    this.campoUsuario = page.getByTestId('username');
    this.campoSenha = page.getByTestId('password');
    this.botaoLogin = page.getByRole('button', { name: 'Login' });
    this.mensagemErro = page.getByTestId('error');
  }

  async acessar() {
    await this.page.goto('/');
  }

  /** Preenche usuário e senha e clica em Login. Não valida o resultado de propósito. */
  async login(usuario: string, senha: string) {
    await this.campoUsuario.fill(usuario);
    await this.campoSenha.fill(senha);
    await this.botaoLogin.click();
  }

  /**
   * Validações ligadas à tela também podem ficar no Page Object, quando
   * forem reaproveitadas em vários testes. Assim o teste lê como uma frase.
   */
  async validarMensagemDeErro(texto: string) {
    await expect(this.mensagemErro).toContainText(texto);
  }
}
