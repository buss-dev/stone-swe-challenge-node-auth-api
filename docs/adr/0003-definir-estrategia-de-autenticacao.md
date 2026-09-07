# 0003. Definir estratégia de autenticação

Data: 2026-09-07

## Status

Aceito

## Contexto

A API exige autenticação de usuários, proteção de rotas, renovação de sessão
e uma forma de invalidar tokens durante o logout.

É necessário armazenar senhas com segurança, autenticar as credenciais
informadas no login e controlar o ciclo de vida dos tokens emitidos.

## Decisão

As senhas serão armazenadas somente como hashes gerados com `bcryptjs`.

A autenticação utilizará:

- access tokens JWT assinados com `jsonwebtoken`;
- refresh tokens opacos, aleatórios e armazenados somente como hash.

O access token terá curta duração, definida em 15 minutos.

O refresh token terá duração maior, definida em 7 dias, e será utilizado
somente para obter um novo access token.

Cada access token deverá conter:

- `sub` — identificador do usuário;
- `jti` — identificador único do token;
- `iat` — data de emissão;
- `exp` — data de expiração.

O segredo utilizado para assinar os access tokens será fornecido pela variável
de ambiente `JWT_SECRET`.

O refresh token deverá:

- ser gerado com valor aleatório e imprevisível;
- ser armazenado no cliente somente em sua forma original;
- ser armazenado no banco somente como hash;
- ser rotacionado após cada utilização;
- ser invalidado após o logout ou após ser substituído.

Senhas, access tokens e refresh tokens em texto puro nunca serão persistidos
ou registrados em logs.

### Tabela `revoked_tokens`

Essa tabela será utilizada para invalidar access tokens antes de sua expiração.

Chave primária:

- `jti` — Partition Key.

Atributos adicionais:

- `expiresAt` — timestamp Unix utilizado como TTL;
- `revokedAt` — timestamp Unix da revogação.

No logout, o `jti` do access token será gravado nessa tabela até o momento em
que o token expiraria naturalmente.

### Tabela `refresh_tokens`

Essa tabela controlará os refresh tokens emitidos.

Chave primária:

- `tokenHash` — Partition Key.

Atributos adicionais:

- `userId` — identificador do usuário;
- `createdAt` — timestamp Unix da criação;
- `expiresAt` — timestamp Unix utilizado como TTL;
- `revokedAt` — timestamp Unix da revogação, quando aplicável;
- `replacedByTokenHash` — hash do token que substituiu o token atual,
  quando aplicável.

O login deverá:

1. buscar o usuário pelo e-mail;
2. comparar a senha informada com o hash armazenado;
3. emitir um access token;
4. emitir e armazenar um refresh token.

A renovação da sessão deverá:

1. receber o refresh token;
2. calcular seu hash;
3. consultar a tabela `refresh_tokens`;
4. verificar se o token existe, não expirou e não foi revogado;
5. revogar o refresh token utilizado;
6. emitir um novo access token;
7. emitir e armazenar um novo refresh token.

A rotação do refresh token deverá impedir que o token anterior continue sendo
utilizado.

O logout deverá:

1. validar o access token;
2. extrair seu `jti`;
3. registrar o `jti` em `revoked_tokens`;
4. receber o refresh token associado à sessão;
5. calcular o hash do refresh token;
6. revogar o registro correspondente em `refresh_tokens`.

As rotas protegidas deverão:

1. validar a assinatura do access token;
2. validar sua expiração;
3. extrair o `jti`;
4. consultar a tabela `revoked_tokens`;
5. rejeitar o token caso exista um registro correspondente.

Falhas na consulta de revogação deverão impedir o acesso à rota protegida,
seguindo uma abordagem fail closed.

O TTL será utilizado para limpeza automática dos registros expirados. A
validade dos tokens continuará sendo verificada pela aplicação, pois a remoção
via TTL pode ocorrer posteriormente à data de expiração.

## Consequências

### Vantagens

- Senhas não são armazenadas em texto puro.
- Access tokens possuem validade curta.
- Sessões podem ser renovadas sem exigir novo login.
- Refresh tokens podem ser revogados individualmente.
- O logout invalida o access token atual e o refresh token da sessão.
- A rotação reduz o risco de reutilização de refresh tokens.
- Access tokens podem ser invalidados antes da expiração.
- O DynamoDB permite consultar diretamente tokens revogados e refresh tokens.
- O TTL reduz o acúmulo de registros antigos.
- Falhas no mecanismo de revogação não liberam acesso indevido.

### Trade-offs

- Cada requisição protegida realiza uma leitura adicional no DynamoDB.
- A renovação de sessão exige operações adicionais de leitura e escrita.
- A autenticação deixa de ser completamente stateless.
- A rotação exige controle do ciclo de vida dos refresh tokens.
- Tokens revogados permanecem armazenados até a limpeza pelo TTL.
- A troca do `JWT_SECRET` invalida todos os access tokens existentes.
- O segredo deve ser mantido fora do código-fonte.
- O armazenamento e o transporte dos refresh tokens exigem cuidados adicionais
  de segurança.
