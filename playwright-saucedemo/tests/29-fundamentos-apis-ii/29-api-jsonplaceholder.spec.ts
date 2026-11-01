import { test, expect } from '@playwright/test';

/**
 * AULA 29: Fundamentos de APIs II
 *
 * O SauceDemo não tem uma API pública, então usamos o JSONPlaceholder
 * (https://jsonplaceholder.typicode.com), uma API REST falsa feita para estudo.
 * Ela responde como uma API real, mas não grava nada de verdade: um POST
 * devolve o recurso "criado", porém ele não aparece num GET seguinte.
 *
 * Aqui não abrimos navegador nenhum. Usamos o fixture `request`, que o
 * Playwright entrega pronto para fazer chamadas HTTP diretamente.
 * Testes de API são muito mais rápidos que testes de interface, por isso
 * costumam ser a base da pirâmide de testes.
 */

// Sobrescrevemos a baseURL do playwright.config.ts SOMENTE neste arquivo.
// Assim podemos escrever request.get('/posts/1') em vez da URL completa,
// sem afetar as outras aulas que usam o SauceDemo.
test.use({ baseURL: 'https://jsonplaceholder.typicode.com' });

// Limite de tempo de resposta aceitável. Deixamos folgado porque a API é
// pública e a rede da sala de aula pode oscilar; em um projeto real esse
// valor viria de um requisito não funcional (SLA).
const TEMPO_MAXIMO_MS = 3000;

test.describe('Aula 29: testes de API com o fixture request', () => {
  test('GET deve retornar um post existente com status 200', async ({ request }) => {
    // Marcamos o tempo antes e depois para medir a duração da chamada.
    // O Playwright não expõe o tempo de resposta diretamente, então medimos na mão.
    const inicio = Date.now();
    const resposta = await request.get('/posts/1');
    const duracao = Date.now() - inicio;

    // 1) Status code: a primeira coisa a validar, porque se ele estiver errado
    //    o resto do corpo provavelmente não faz sentido.
    expect(resposta.status()).toBe(200);
    // ok() é um atalho que retorna true para qualquer status entre 200 e 299.
    expect(resposta.ok()).toBeTruthy();

    // 2) Headers: garantem que o servidor está devolvendo JSON.
    //    Os nomes de headers chegam sempre em minúsculo no Playwright.
    expect(resposta.headers()['content-type']).toContain('application/json');

    // 3) Corpo: convertemos para objeto e validamos campos e tipos.
    const post = await resposta.json();
    expect(post.id).toBe(1);
    expect(post.userId).toBe(1);
    expect(typeof post.title).toBe('string');
    // toHaveProperty é útil para validar o "contrato" da API (quais campos existem).
    expect(post).toHaveProperty('body');

    // 4) Tempo de resposta: um teste funcional também pode checar desempenho básico.
    expect(duracao).toBeLessThan(TEMPO_MAXIMO_MS);
  });

  test('GET de listagem deve retornar 100 posts', async ({ request }) => {
    const resposta = await request.get('/posts');
    expect(resposta.status()).toBe(200);

    const posts = await resposta.json();
    // Validar o tamanho da lista ajuda a detectar paginação ou filtros quebrados.
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(100);
  });

  test('GET com query string deve filtrar posts por usuário', async ({ request }) => {
    // O parâmetro `params` monta a query string (?userId=1) para nós,
    // evitando erros de concatenação e de encoding na URL.
    const resposta = await request.get('/posts', { params: { userId: 1 } });
    expect(resposta.status()).toBe(200);

    const posts = await resposta.json();
    expect(posts.length).toBeGreaterThan(0);
    // every() confirma que TODOS os itens respeitam o filtro, não apenas o primeiro.
    expect(posts.every((p: { userId: number }) => p.userId === 1)).toBe(true);
  });

  test('POST deve criar um novo post e retornar status 201', async ({ request }) => {
    const novoPost = {
      title: 'Aula 29',
      body: 'Testando API com Playwright',
      userId: 7,
    };

    // `data` é serializado como JSON automaticamente e o header
    // Content-Type: application/json é enviado sem precisarmos informar.
    const resposta = await request.post('/posts', { data: novoPost });

    // 201 (Created) é o status correto para criação, e não 200.
    expect(resposta.status()).toBe(201);

    const criado = await resposta.json();
    // toMatchObject compara só os campos enviados, ignorando o `id` gerado
    // pelo servidor, que não conhecemos antes da chamada.
    expect(criado).toMatchObject(novoPost);
    expect(criado.id).toBeDefined();
  });

  test('PUT deve substituir o post inteiro', async ({ request }) => {
    // PUT substitui o recurso completo, por isso enviamos todos os campos.
    const postAtualizado = {
      id: 1,
      title: 'Título substituído',
      body: 'Corpo substituído',
      userId: 1,
    };

    const resposta = await request.put('/posts/1', { data: postAtualizado });
    expect(resposta.status()).toBe(200);
    expect(await resposta.json()).toEqual(postAtualizado);
  });

  test('PATCH deve alterar apenas o campo enviado', async ({ request }) => {
    // PATCH altera parcialmente: mandamos só o título e o resto deve continuar igual.
    const resposta = await request.patch('/posts/1', {
      data: { title: 'Somente o título mudou' },
    });
    expect(resposta.status()).toBe(200);

    const post = await resposta.json();
    expect(post.title).toBe('Somente o título mudou');
    // Esta é a diferença essencial para o PUT: os outros campos foram preservados.
    expect(post.userId).toBe(1);
    expect(post.body).toBeTruthy();
  });

  test('DELETE deve remover o post e retornar corpo vazio', async ({ request }) => {
    const resposta = await request.delete('/posts/1');
    expect(resposta.status()).toBe(200);
    // O JSONPlaceholder devolve um objeto vazio após remover.
    expect(await resposta.json()).toEqual({});
  });

  test('GET de recurso inexistente deve retornar 404', async ({ request }) => {
    // Teste negativo: tão importante quanto o positivo. Garante que a API
    // responde de forma controlada quando pedimos algo que não existe,
    // em vez de devolver 200 com dados errados ou um erro 500.
    const resposta = await request.get('/posts/99999');

    expect(resposta.status()).toBe(404);
    expect(resposta.ok()).toBeFalsy();
    expect(await resposta.json()).toEqual({});
  });
});
