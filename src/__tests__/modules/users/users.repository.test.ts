import { jest } from "@jest/globals";

import { dynamoDbDocumentClient } from "../../../infra/dynamodb/client.js";
import {
  UsersRepository,
  type UserRecord,
} from "../../../modules/users/users.repository.js";

describe("UsersRepository", () => {
  const repository = new UsersRepository();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retorna o usuário encontrado", async () => {
    const user: UserRecord = {
      userId: "user-001",
      email: "user@example.com",
      passwordHash: "hashed-password",
    };

    const sendMock = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValue({
        Items: [user],
        $metadata: {},
      } as never);

    const result = await repository.findByEmail("user@example.com");

    expect(result).toEqual(user);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando o usuário não existe", async () => {
    const sendMock = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValue({
        Items: [],
        $metadata: {},
      } as never);

    const result = await repository.findByEmail("unknown@example.com");

    expect(result).toBeNull();
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
