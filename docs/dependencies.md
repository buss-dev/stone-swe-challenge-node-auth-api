# Dependências

Dependências do projeto, agrupadas pela etapa em que foram introduzidas. Ver `docs/adr/` para decisões arquiteturais maiores.

## Runtime

| Dependência                      | Docs                                          | Por quê                                                      |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| [express](https://expressjs.com) | [link](https://www.npmjs.com/package/express) | Framework HTTP minimalista, sem estrutura de projeto imposta |

## Desenvolvimento

| Dependência                                      | Docs                                                   | Por quê                                                                       |
| ------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [typescript](https://www.typescriptlang.org)     | [link](https://www.npmjs.com/package/typescript)       | Tipagem estática, requisito do desafio                                        |
| [tsx](https://github.com/privatenumber/tsx)      | [link](https://www.npmjs.com/package/tsx)              | Roda `.ts` direto em dev (baseado em esbuild), sem etapa manual de compilação |
| [jest](https://jestjs.io/)                       | [link](https://www.npmjs.com/package/jest)             | Executor de testes automatizados                                              |
| [ts-jest](https://kulshekhar.github.io/ts-jest/) | [link](https://www.npmjs.com/package/ts-jest)          | Integra TypeScript ao Jest                                                    |
| [supertest](https://github.com/ladjs/supertest)  | [link](https://www.npmjs.com/package/supertest)        | Testes HTTP da aplicação                                                      |
| @types/node                                      | [link](https://www.npmjs.com/package/@types/node)      | Tipagens dos módulos nativos do Node                                          |
| @types/express                                   | [link](https://www.npmjs.com/package/@types/express)   | Tipagens do Express (escrito em JS puro)                                      |
| @types/jest                                      | [link](https://www.npmjs.com/package/@types/jest)      | Tipagens do Jest para TypeScript                                              |
| @types/supertest                                 | [link](https://www.npmjs.com/package/@types/supertest) | Tipagens do Supertest para TypeScript                                         |
