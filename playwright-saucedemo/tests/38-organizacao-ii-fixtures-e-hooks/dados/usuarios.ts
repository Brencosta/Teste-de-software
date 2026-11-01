/**
 * Massa de dados da aula 38.
 *
 * Separar os dados do código do teste traz duas vantagens:
 * - O teste fica genérico: a mesma lógica roda para vários usuários.
 * - Para incluir um novo caso, basta acrescentar uma linha aqui, sem
 *   escrever um teste novo (é a ideia do teste "data-driven").
 *
 * Em projetos reais esses dados podem vir de JSON, CSV, banco ou variáveis
 * de ambiente (senhas reais NUNCA devem ficar versionadas no código).
 * O SauceDemo publica as credenciais na própria tela de login, por isso
 * podemos deixá-las aqui.
 */

export const SENHA_PADRAO = 'secret_sauce';

export interface UsuarioSauceDemo {
  usuario: string;
  senha: string;
  /** O que esse usuário simula no SauceDemo. Aparece no nome do teste. */
  descricao: string;
  /** true se o login deve dar certo. */
  podeLogar: boolean;
  /** Mensagem esperada quando o login é recusado. */
  mensagemErro?: string;
  /** Tempo máximo para o login terminar. Só o usuário lento precisa de mais. */
  timeoutLogin?: number;
}

/**
 * Usuários oficiais do SauceDemo.
 * Usamos um objeto (e não um array) para poder acessar por nome nos testes,
 * por exemplo: usuarios.standard. Para testes data-driven, transformamos em
 * lista com Object.values(usuarios).
 */
export const usuarios = {
  standard: {
    usuario: 'standard_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário padrão, sem defeitos',
    podeLogar: true,
  },
  bloqueado: {
    usuario: 'locked_out_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário bloqueado',
    podeLogar: false,
    mensagemErro: 'Sorry, this user has been locked out.',
  },
  problema: {
    usuario: 'problem_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário com defeitos visuais e funcionais',
    podeLogar: true,
  },
  lento: {
    usuario: 'performance_glitch_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário com lentidão proposital',
    podeLogar: true,
    timeoutLogin: 15_000,
  },
  erro: {
    usuario: 'error_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário que dispara erros em algumas ações',
    podeLogar: true,
  },
  visual: {
    usuario: 'visual_user',
    senha: SENHA_PADRAO,
    descricao: 'usuário com diferenças visuais na tela',
    podeLogar: true,
  },
} satisfies Record<string, UsuarioSauceDemo>;
// `satisfies` confere que todos os itens seguem a interface, mas mantém o
// TypeScript sabendo exatamente quais chaves existem (standard, bloqueado...).

/** Lista de todos os usuários, pronta para testes data-driven. */
export const todosOsUsuarios: UsuarioSauceDemo[] = Object.values(usuarios);

/** Cenários de validação do formulário de checkout. */
export const cenariosCheckoutInvalido = [
  {
    cenario: 'sem nome',
    dados: { nome: '', sobrenome: 'Silva', cep: '01001-000' },
    erro: 'Error: First Name is required',
  },
  {
    cenario: 'sem sobrenome',
    dados: { nome: 'Maria', sobrenome: '', cep: '01001-000' },
    erro: 'Error: Last Name is required',
  },
  {
    cenario: 'sem CEP',
    dados: { nome: 'Maria', sobrenome: 'Silva', cep: '' },
    erro: 'Error: Postal Code is required',
  },
];

export const compradorValido = { nome: 'Maria', sobrenome: 'Silva', cep: '01001-000' };
