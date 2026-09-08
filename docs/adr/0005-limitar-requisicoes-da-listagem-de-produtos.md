# 0005. Limitar requisicoes da listagem de produtos

Data: 2026-09-07

## Status

Aceito

## Contexto

`GET /products` e uma rota autenticada que consulta o DynamoDB. Sem controle de
frequencia, um cliente pode concentrar requisicoes nessa operacao e aumentar a
pressao sobre a API e o banco de dados.

O IP do cliente so pode ser extraido de headers encaminhados quando a topologia
de proxy e conhecida. Confiar em `X-Forwarded-For` por padrao permitiria que um
cliente escolhesse arbitrariamente sua identidade para o limite.

## Decisao

Aplicar um limite por IP somente em `GET /products`, usando uma janela fixa em
memoria. Os valores sao configurados por `RATE_LIMIT_MAX_REQUESTS` (padrao 100)
e `RATE_LIMIT_WINDOW_SECONDS` (padrao 60). Requisicoes acima do limite recebem
`429 Too Many Requests` e o header `Retry-After`.

O Express recebe `TRUST_PROXY_HOPS`, com padrao 0. Portanto, headers de proxy
nao sao confiados ate que a implantacao configure explicitamente quantos saltos
de proxy ela controla.

## Consequencias

- A rota mais custosa ganha protecao simples e configuravel.
- O limite e local ao processo: em varias instancias, cada instancia mantem seu
  proprio contador, portanto o limite nao e global.
- Os contadores residem em memoria e a limpeza ocorre apenas quando aquele IP
  faz uma nova requisicao apos o vencimento. Assim, o cache nao e estritamente
  limitado e IPs que nao retornam podem permanecer na memoria; uma solucao de
  producao com escala deve usar armazenamento compartilhado e expiracao/limite
  de memoria apropriados.
- A configuracao incorreta de `TRUST_PROXY_HOPS` pode identificar o cliente de
  forma errada; ela deve corresponder a topologia real de rede.
