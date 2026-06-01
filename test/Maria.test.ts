// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { MariaDatabase, type Result } from "../source/mod.ts";
import { assertEquals } from "@std/assert/equals";
import type { IFooModel } from "./interfaces.ts";
import { MARIA_QUERIES } from "./queries.ts";

const getEnv = Deno.env.get;

const table = getEnv("TABLE_NAME")!;

const database = new MariaDatabase(
  getEnv("MARIA_DATABASE_HOST")!,
  Number(getEnv("MARIA_DATABASE_PORT"))!,
  getEnv("MARIA_DATABASE_NAME")!,
  getEnv("MARIA_DATABASE_USERNAME")!,
  getEnv("MARIA_DATABASE_PASSWORD")!,
  2,
);

let clientA = await database.createClient();
let clientB = await database.createClient();

Deno.test.afterAll(async () => {
  await clientA.dispose();
  await clientB.dispose();
  await database.dispose();
});

Deno.test.beforeEach(async () => {
  await clientA.dispose();
  await clientB.dispose();

  clientA = await database.createClient();
  clientB = await database.createClient();

  await clientA.query(MARIA_QUERIES.TABLE.DROP(table));
  await clientA.query(MARIA_QUERIES.TABLE.CREATE(table));
});

Deno.test("Maria - Bulk insert", async () => {
  const mockA = MARIA_QUERIES.INSERT(table);
  const resultA = await clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = MARIA_QUERIES.INSERT(table);
  const resultB = await clientA.query<IFooModel>(mockB.query, mockB.binds);

  assertEquals(resultA.rows.at(0)?.id, 1);
  assertEquals(resultA.rows.at(0)?.name, mockA.binds[0]);
  assertEquals(
    resultA.rows.at(0)?.date_timestamp.getTime(),
    (mockA.binds[1] as Date).getTime(),
  );

  assertEquals(resultB.rows.at(0)?.id, 2);
  assertEquals(resultB.rows.at(0)?.name, mockB.binds[0]);
  assertEquals(
    resultB.rows.at(0)?.date_timestamp.getTime(),
    (mockB.binds[1] as Date).getTime(),
  );
});

Deno.test("Maria - Select", async () => {
  const mockA = MARIA_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = MARIA_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mockB.query, mockB.binds);

  const result = await clientA.query<IFooModel>(
    MARIA_QUERIES.SELECT_ALL(table),
  );

  assertEquals(result.rows.length, 2);
  assertEquals(result.rows.pop()?.name, mockB.binds[0]);
});

Deno.test("Maria - Transaction", async () => {
  await clientA.begin();

  let mock = MARIA_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mock.query, mock.binds);

  await clientA.rollback();

  await clientA.begin();

  mock = MARIA_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mock.query, mock.binds);

  const result = await clientA.query<IFooModel>(`SELECT * FROM ${table}`);

  await clientA.commit();

  assertEquals(result.rows.at(result.rows.length - 1)?.id, 2);
  assertEquals(result.rows.at(result.rows.length - 1)?.name, mock.binds[0]);
});

Deno.test("Maria - Concurrent", async () => {
  const mockA = MARIA_QUERIES.INSERT(table);
  const promiseA = clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = MARIA_QUERIES.INSERT(table);
  const promiseB = clientB.query<IFooModel>(mockB.query, mockB.binds);

  const mockC = MARIA_QUERIES.INSERT(table);
  const promiseC: Promise<Result<IFooModel>> | undefined = new Promise(
    (resolve) => {
      database.createClient()
        .then((client) => {
          client.query<IFooModel>(mockC.query, mockC.binds)
            .then((result) => {
              client.dispose()
                .then(() => resolve(result));
            });
        });
    },
  );

  await Promise.all([
    promiseA,
    promiseB,
  ]);

  await Promise.all([
    clientA.dispose(),
    promiseC,
  ]);

  const result = await clientA.query<IFooModel>(`SELECT * FROM ${table}`);
  assertEquals(result.rows[0].name, mockA.binds[0]);
  assertEquals(result.rows[1].name, mockB.binds[0]);
  assertEquals(result.rows[2].name, mockC.binds[0]);
});
