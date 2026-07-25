// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { Pool } from "pg";
import { Database, PgClient } from "@4uruanna/sql-connector";
import type { DatabaseConfig } from "../../abstract/DatabaseConfig.ts";
import { CONSTANT } from "../../constant.ts";

/**
 * PostgreSQL database implementation.
 */
export class PgDatabase extends Database {
  private readonly _pool: Pool;

  /**
   * Creates a new PostgreSQL database instance.
   * @param {DatabaseConfig} config - The configuration
   */
  public constructor(
    config: DatabaseConfig
  ) {
    super();

    this._pool = new Pool({
      ...config,
      max: config.connectionLimit,
      idleTimeoutMillis: CONSTANT.IDLE_TIMEOUT * 1000,
      connectionTimeoutMillis: CONSTANT.CONNECTION_TIMEOUT * 1000
    });
  }

  /**
   * Creates a new database client with its own connection.
   * @returns {Promise<PgClient>}
   */
  public override async createClient(): Promise<PgClient> {
    const connection = await this._pool.connect();
    const client = new PgClient(connection);
    return client;
  }

  /**
   * Disposes the database.
   * @returns {Promise<void>}
   */
  public override async dispose(): Promise<void> {
    await this._pool.end();
  }
}
