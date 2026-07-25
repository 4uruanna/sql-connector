// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

/* API
 ************************/
export { Database } from "./abstract/Database.ts";
export { Client } from "./abstract/Client.ts";
export { TransactionInProgressError } from "./error/TransactionInProgressError.ts";
export { TransactionNotFoundError } from "./error/TransactionNotFoundError.ts";
export * from "./abstract/types.ts";

/* Postgres
 ************************/
export { PgClient } from "./db/pg/PgClient.ts";
export { PgDatabase } from "./db/pg/PgDatabase.ts";

/* MariaDB
 ************************/
export { MariaClient } from "./db/maria/MariaClient.ts";
export { MariaDatabase } from "./db/maria/MariaDatabase.ts";
