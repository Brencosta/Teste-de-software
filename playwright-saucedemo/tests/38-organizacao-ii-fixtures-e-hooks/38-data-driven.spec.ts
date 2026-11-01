import { test, testLogado, expect } from './fixtures/fixtures';
import { todosOsUsuarios, cenariosCheckoutInvalido } from './dados/usuarios';

/**
 * AULA 38: Testes data-driven (orientados a dados)
 *
 * Em vez de escrever um teste para cada usuário, escrevemos UM teste e o
 * repetimos para cada linha da massa de dados (dados/usuarios.ts).
 *
 * O `for` roda quando o arquivo é carregado e REGISTRA um teste por item.
 * Por isso cada usuário aparece como um teste separado no relatório, e uma
 * falha em um usuário não impede os outros de rodarem.
 *
 * Regra importante: o título de cada teste precisa ser ÚNICO. Por isso
 * colocamos o nome do usuário no título.
 */

test.describe('Aula 38: login com todos os usuários do SauceDemo', () => {
  for (const usuario of todosOsUsuarios) {
    test(`login com ${usuario.usuario} (${usuario.descricao})`, async ({
      loginPage,
      inventoryPage,
    }) => {
      await loginPage.acessar();
      await loginPage.login(usuario.usuario, usuario.senha);

      if (usuario.podeLogar) {
        // Usuários lentos recebem um timeout maior, vindo da própria massa.
        // Assim a regra "este usuário é lento" fica nos DADOS, não no código.
        const timeout = usuario.timeoutLogin ?? 5_000;
        await expect(inventoryPage.titulo).toHaveText('Products', { timeout });
        await expect(inventoryPage.produtos).toHaveCount(6);
      } else {
        await loginPage.validarMensagemDeErro(usuario.mensagemErro!);
      }
    });
  }
});

testLogado.describe('Aula 38: validações do formulário de checkout', () => {
  for (const { cenario, dados, erro } of cenariosCheckoutInvalido) {
    testLogado(`checkout ${cenario} deve exibir "${erro}"`, async ({
      usuarioLogado,
      cartPage,
      checkoutPage,
    }) => {
      await usuarioLogado.adicionarAoCarrinho('Sauce Labs Backpack');
      await usuarioLogado.abrirCarrinho();
      await cartPage.irParaCheckout();

      await checkoutPage.preencherDados(dados);

      await expect(checkoutPage.mensagemErro).toHaveText(erro);
    });
  }
});
