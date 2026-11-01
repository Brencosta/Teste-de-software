import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object do carrinho (cart.html). */
export class CartPage {
  readonly page: Page;
  readonly itens: Locator;
  readonly nomesItens: Locator;
  readonly botaoCheckout: Locator;
  readonly botaoContinuarComprando: Locator;

  constructor(page: Page) {
    this.page = page;
    this.itens = page.getByTestId('inventory-item');
    this.nomesItens = page.getByTestId('inventory-item-name');
    this.botaoCheckout = page.getByRole('button', { name: 'Checkout' });
    this.botaoContinuarComprando = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async validarQueEstaAberto() {
    await expect(this.page).toHaveURL('/cart.html');
  }

  async removerItem(nome: string) {
    await this.itens.filter({ hasText: nome }).getByRole('button', { name: 'Remove' }).click();
  }

  async irParaCheckout() {
    await this.botaoCheckout.click();
  }

  async continuarComprando() {
    await this.botaoContinuarComprando.click();
  }
}
