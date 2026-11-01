import { type Locator, type Page } from '@playwright/test';

/** Dados que o comprador informa no primeiro passo do checkout. */
export interface DadosComprador {
  nome: string;
  sobrenome: string;
  cep: string;
}

/**
 * Page Object do checkout.
 *
 * O checkout do SauceDemo tem três telas (informações, revisão e conclusão).
 * Como elas formam um único fluxo curto, agrupamos tudo em uma classe.
 * Em um sistema maior, cada etapa poderia virar seu próprio Page Object.
 */
export class CheckoutPage {
  readonly page: Page;

  // Etapa 1: informações do comprador
  readonly campoNome: Locator;
  readonly campoSobrenome: Locator;
  readonly campoCep: Locator;
  readonly botaoContinuar: Locator;
  readonly mensagemErro: Locator;

  // Etapa 2: revisão do pedido
  readonly subtotal: Locator;
  readonly imposto: Locator;
  readonly total: Locator;
  readonly botaoFinalizar: Locator;

  // Etapa 3: conclusão
  readonly tituloConclusao: Locator;
  readonly botaoVoltarParaProdutos: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campoNome = page.getByPlaceholder('First Name');
    this.campoSobrenome = page.getByPlaceholder('Last Name');
    this.campoCep = page.getByPlaceholder('Zip/Postal Code');
    this.botaoContinuar = page.getByRole('button', { name: 'Continue' });
    this.mensagemErro = page.getByTestId('error');

    this.subtotal = page.getByTestId('subtotal-label');
    this.imposto = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.botaoFinalizar = page.getByRole('button', { name: 'Finish' });

    this.tituloConclusao = page.getByTestId('complete-header');
    this.botaoVoltarParaProdutos = page.getByRole('button', { name: 'Back Home' });
  }

  async preencherDados(dados: DadosComprador) {
    await this.campoNome.fill(dados.nome);
    await this.campoSobrenome.fill(dados.sobrenome);
    await this.campoCep.fill(dados.cep);
    await this.botaoContinuar.click();
  }

  async finalizar() {
    await this.botaoFinalizar.click();
  }
}
