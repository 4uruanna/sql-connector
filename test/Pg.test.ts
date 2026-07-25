// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { assertArrayIncludes, assertEquals } from "@std/assert";
import { PgDatabase, type Result } from "@4uruanna/sql-connector";
import { PG_QUERIES } from "./queries.ts";
import type { IFooModel } from "./interfaces.ts";

const getEnv = Deno.env.get;

const table = getEnv("test.TABLE_NAME")!;

const database = new PgDatabase({
  host: getEnv("PG_DATABASE_HOST")!,
  port: Number(getEnv("PG_DATABASE_PORT"))!,
  database: getEnv("PG_DATABASE_NAME")!,
  user: getEnv("PG_DATABASE_USERNAME")!,
  password: getEnv("PG_DATABASE_PASSWORD")!,
  connectionLimit: 2,
});

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

  await clientA.query(PG_QUERIES.TABLE.DROP(table));
  await clientA.query(PG_QUERIES.TABLE.CREATE(table));
});

Deno.test("Pg - Bulk insert", async () => {
  const mockA = PG_QUERIES.INSERT(table);
  const resultA = await clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = PG_QUERIES.INSERT(table);
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

Deno.test("Pg - Select", async () => {
  const mockA = PG_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = PG_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mockB.query, mockB.binds);

  const result = await clientA.query<IFooModel>(PG_QUERIES.SELECT_ALL(table));

  assertEquals(result.rows.length, 2);
  assertEquals(result.rows.pop()?.name, mockB.binds[0]);
});

Deno.test("Pg - Transaction", async () => {
  await clientA.begin();

  let mock = PG_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mock.query, mock.binds);

  await clientA.rollback();

  await clientA.begin();

  mock = PG_QUERIES.INSERT(table);
  await clientA.query<IFooModel>(mock.query, mock.binds);

  const result = await clientA.query<IFooModel>(`SELECT * FROM ${table}`);

  await clientA.commit();

  assertEquals(result.rows.at(result.rows.length - 1)?.id, 2);
  assertEquals(result.rows.at(result.rows.length - 1)?.name, mock.binds[0]);
});

Deno.test("Pg - Concurrent", async () => {
  const mockA = PG_QUERIES.INSERT(table);
  const promiseA = clientA.query<IFooModel>(mockA.query, mockA.binds);

  const mockB = PG_QUERIES.INSERT(table);
  const promiseB = clientB.query<IFooModel>(mockB.query, mockB.binds);

  const mockC = PG_QUERIES.INSERT(table);
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

  for (const row of result.rows) {
    assertArrayIncludes(
      [
        mockA.binds[0],
        mockB.binds[0],
        mockC.binds[0]
      ],
      [row.name]
    );
  }
});
