# Dependências

Dependências do projeto, agrupadas pela etapa em que foram introduzidas. Ver `docs/adr/` para decisões arquiteturais maiores.

## Runtime

| Dependência                      | Docs                                          | Por quê                                                      |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| [express](https://expressjs.com) | [link](https://www.npmjs.com/package/express) | Framework HTTP minimalista, sem estrutura de projeto imposta |

## Desenvolvimento

| Dependência                                  | Docs                                                 | Por quê                                                                       |
| -------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| [typescript](https://www.typescriptlang.org) | [link](https://www.npmjs.com/package/typescript)     | Tipagem estática, requisito do desafio                                        |
| [tsx](https://github.com/privatenumber/tsx)  | [link](https://www.npmjs.com/package/tsx)            | Roda `.ts` direto em dev (baseado em esbuild), sem etapa manual de compilação |
| @types/node                                  | [link](https://www.npmjs.com/package/@types/node)    | Tipagens dos módulos nativos do Node                                          |
| @types/express                               | [link](https://www.npmjs.com/package/@types/express) | Tipagens do Express (escrito em JS puro)                                      |
