import { expect, type Locator, type Page } from '@playwright/test';

/** Opções de ordenação. Os valores são os `value` do <select> do SauceDemo. */
export type Ordenacao = 'az' | 'za' | 'lohi' | 'hilo';

/** Page Object da listagem de produtos (inventory.html). */
export class InventoryPage {
  readonly page: Page;
  readonly titulo: Locator;
  readonly produtos: Locator;
  readonly nomesProdutos: Locator;
  readonly precosProdutos: Locator;
  readonly seletorOrdenacao: Locator;
  readonly badgeCarrinho: Locator;
  readonly linkCarrinho: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulo = page.getByTestId('title');
    this.produtos = page.getByTestId('inventory-item');
    this.nomesProdutos = page.getByTestId('inventory-item-name');
    this.precosProdutos = page.getByTestId('inventory-item-price');
    this.seletorOrdenacao = page.getByTestId('product-sort-container');
    this.badgeCarrinho = page.getByTestId('shopping-cart-badge');
    this.linkCarrinho = page.getByTestId('shopping-cart-link');
  }

  async acessar() {
    await this.page.goto('/inventory.html');
  }

  /** Garante que estamos na listagem. Usado logo após o login. */
  async validarQueEstaAberta() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.titulo).toHaveText('Products');
  }

  /**
   * Retorna o "cartão" de um produto pelo nome. Método privado porque é um
   * detalhe interno: os testes só precisam saber o nome do produto.
   */
  private produto(nome: string): Locator {
    return this.produtos.filter({ hasText: nome });
  }

  async adicionarAoCarrinho(nome: string) {
    await this.produto(nome).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removerDoCarrinho(nome: string) {
    await this.produto(nome).getByRole('button', { name: 'Remove' }).click();
  }

  async ordenarPor(opcao: Ordenacao) {
    await this.seletorOrdenacao.selectOption(opcao);
  }

  /** Lê os preços exibidos na tela, na ordem em que aparecem, já como números. */
  async obterPrecos(): Promise<number[]> {
    const textos = await this.precosProdutos.allTextContents();
    return textos.map((texto) => Number(texto.replace('$', '')));
  }

  async obterNomes(): Promise<string[]> {
    return this.nomesProdutos.allTextContents();
  }

  async abrirCarrinho() {
    await this.linkCarrinho.click();
  }
}
