## Diretrizes gerais

Será utilizado `Pragmatic RESTful API` conforme manifesto não oficial de [Vinay Sahni](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)

Seguir [OpenAPI Specification OAS](https://github.com/OAI/OpenAPI-Specification/)

Seguir [Zalando API Guideline](https://opensource.zalando.com/restful-api-guidelines/)

> NOTA: havíamos usado JSON:API em outro projeto para paginação, mas a especificação ficou um pouco
> pesada na especificação de erros. Em vez, disso, seguimos o Pragmatic RESTful API, que utliza o RFC 9457
> para mensagens de erros mais diretas, e também resolve problemas de paginação.

## Erros

Para erros, seguir **Problem Details for HTTP APIs** do [RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457)

Abaixo um exemplo de resposta de erro

```http
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json
Content-Language: en

{
 "type": "https://example.com/probs/out-of-credit",
 "title": "You do not have enough credit.",
 "detail": "Your current balance is 30, but that costs 50.",
 "instance": "/account/12345/msgs/abc",
 "balance": 30,
 "accounts": ["/account/12345",
              "/account/67890"]
}
```
