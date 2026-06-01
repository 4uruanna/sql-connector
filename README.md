# @4uruanna/sql-connector

[![JSR](https://jsr.io/badges/@4uruanna/sql-connector?style=flat-square)](https://jsr.io/@4uruanna/di)
[![Deno](https://img.shields.io/badge/Deno->=2.0-000000?style=flat-square&logo=deno)](https://deno.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white)](https://mariadb.org)

Lightweight TypeScript library that provides a unified interface for connecting
to and interacting with PostgreSQL and MariaDB databases.

## Usage

> **Notice :** Always call `dispose()` on clients to release them back to the
> connection pool. The base `Client.dispose()` method automatically rolls back
> any open transactions before releasing the connection.

### PostgreSQL

```ts
import { PgDatabase } from "@4uruanna/sql-connector";

interface FooModel {
  id: number;
  name: string;
}

const pg = new PgDatabase(
  "localhost",
  5432,
  "mydatabase",
  "user",
  "password",
  "public",
  4,
);

const client = await pg.createClient();

try {
  const result = await client.query<FooModel>(
    "SELECT id, name FROM users WHERE id = $1",
    [1],
  );

  console.log(result.rows);
} finally {
  await client.dispose();
}

await pg.dispose();
```

### MariaDB

```ts
import { MariaDatabase } from "@4uruanna/sql-connector";

interface FooModel {
  id: number;
  name: string;
}

const maria = new MariaDatabase(
  "localhost",
  3306,
  "mydatabase",
  "user",
  "password",
  4,
);

const client = await maria.createClient();

try {
  const result = await client.query<{ id: number; name: string }>(
    "SELECT id, name FROM users WHERE id = ?",
    [1],
  );

  console.log(result.rows);
} finally {
  await client.dispose();
}

await maria.dispose();
```

### Transaction Management

```ts
import { PgDatabase } from "@4uruanna/sql-connector";

const pg = new PgDatabase(
  "localhost",
  5432,
  "mydatabase",
  "user",
  "password",
  "public",
);

const client = await pg.createClient();

try {
  await client.begin();

  await client.query(
    "INSERT INTO users (name, email) VALUES ($1, $2)",
    ["John Doe", "john@example.com"],
  );

  await client.query(
    "UPDATE accounts SET balance = balance - $1 WHERE user_id = $2",
    [100, 1],
  );

  await client.commit();
} catch (error) {
  await client.rollback();
  throw error;
} finally {
  await client.dispose();
}

await pg.dispose();
```

## Testing

The library includes tests.

### Start Test Databases

```bash
# Start MariaDB
docker run --name dev-mariadb -e MARIADB_ROOT_PASSWORD=your_password -p 3306:3306 -d mariadb:12

# Start PostgreSQL
docker run --name postgres-container -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:latest
```

### Configure Environment

Create a `.env` file in the project root or set environment variables for your
test database connections:

```bash
# PostgreSQL
PG_DATABASE_HOST=localhost
PG_DATABASE_PORT=5432
PG_DATABASE_NAME=test
PG_DATABASE_USERNAME=postgres
PG_DATABASE_PASSWORD=your_password
PG_DATABASE_SCHEMA=public

# MariaDB
MARIA_DATABASE_HOST=localhost
MARIA_DATABASE_PORT=3306
MARIA_DATABASE_NAME=test
MARIA_DATABASE_USERNAME=root
MARIA_DATABASE_PASSWORD=your_password
```

### Run Tests

```bash
deno test --allow-net --allow-sys --allow-env --env-file ./test/
```
