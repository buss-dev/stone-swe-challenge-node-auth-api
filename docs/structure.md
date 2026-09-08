# Estrutura do projeto

## Visão geral

O projeto é organizado por responsabilidade. A API HTTP fica separada das
regras de negócio, que ficam separadas do acesso ao DynamoDB.

```text
src/
├── config/
├── docs/
├── infra/
│   └── dynamodb/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── products/
│   └── users/
├── scripts/
│   └── data/
├── shared/
├── app.ts
└── server.ts
```

## Pastas e arquivos

### `src/config`

Centraliza a leitura e validação das variáveis de ambiente. A aplicação falha
ao iniciar quando uma configuração obrigatória é inválida ou ausente.

### `src/docs`

Contém o documento OpenAPI usado pelo Swagger UI. A especificação acompanha o
contrato HTTP implementado pela aplicação.

### `src/infra`

Contém integrações com recursos externos. Atualmente, concentra a criação do
cliente DynamoDB e do document client do AWS SDK.

### `src/middlewares`

Contém comportamentos transversais executados durante o ciclo das requisições
Express, como o tratamento centralizado de erros.

### `src/modules`

Organiza o código por domínio da aplicação.

#### `src/modules/auth`

Contém autenticação, geração e validação de tokens, hash de senhas,
repositories de refresh tokens e tokens revogados, middleware de autenticação,
controllers e rotas.

#### `src/modules/products`

Contém o repository, controller e rotas responsáveis pela listagem paginada
de produtos.

#### `src/modules/users`

Contém o repository responsável por consultar e persistir usuários.

### `src/scripts`

Contém scripts operacionais executados fora do ciclo HTTP, como criação das
tabelas e seed local.

### `src/scripts/data`

Contém dados estáticos usados pelo seed, como a lista de produtos de exemplo.

### `src/shared`

Contém componentes reutilizáveis entre módulos, como erros HTTP estruturados.

### `src/app.ts`

Monta a aplicação Express, registra middlewares, Swagger e rotas. Não inicia o
servidor para permitir testes HTTP com `supertest`.

### `src/server.ts`

É o ponto de entrada executável. Importa a aplicação e inicia o servidor na
porta configurada.

### `src/__tests__`

Contém testes de configuração, infraestrutura, repositories, services e rotas
HTTP. Os testes HTTP usam `supertest` e os testes unitários isolam dependências
externas quando necessário.

## Por que essa organização?

- separa transporte HTTP, regras de negócio e persistência;
- facilita testes isolados por camada;
- reduz o acoplamento entre Express e DynamoDB;
- permite substituir detalhes de infraestrutura sem reescrever os módulos;
- torna explícita a responsabilidade de cada domínio;
- mantém scripts operacionais fora do fluxo de requisições.
