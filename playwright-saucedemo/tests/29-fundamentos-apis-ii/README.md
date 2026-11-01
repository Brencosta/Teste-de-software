# Aula 29: Fundamentos de APIs II

## Conceito

Testes de API validam o sistema sem passar pela interface gráfica. São rápidos, estáveis e permitem testar regras de negócio diretamente no "backend".

O SauceDemo não tem API pública, então usamos o [JSONPlaceholder](https://jsonplaceholder.typicode.com), uma API REST de estudo.

No Playwright, chamadas HTTP são feitas com o fixture `request`, que já vem pronto em todo teste (assim como o `page`).

## O que os testes demonstram

| Método | O que valida |
| ------ | ------------ |
| GET    | status 200, header `content-type`, campos do corpo e tempo de resposta |
| GET com `params` | filtro por query string (`?userId=1`) |
| POST   | criação com status 201 e corpo devolvido |
| PUT    | substituição completa do recurso |
| PATCH  | alteração parcial (os outros campos são preservados) |
| DELETE | remoção com corpo vazio |
| GET negativo | recurso inexistente retorna 404 |

Repare no `test.use({ baseURL: ... })` no topo do arquivo: ele troca a baseURL apenas para esta aula.

## Como rodar

```bash
npx playwright test tests/29-fundamentos-apis-ii
# ou
npm run aula:29
```
