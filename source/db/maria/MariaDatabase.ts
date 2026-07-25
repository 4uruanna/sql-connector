// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { createPool, type Pool } from "mariadb";
import { Database, MariaClient } from "@4uruanna/sql-connector";
import type { DatabaseConfig } from "../../abstract/DatabaseConfig.ts";
import { CONSTANT } from "../../constant.ts";

/**
 * MariaDB database implementation.
 */
export class MariaDatabase extends Database {
  private readonly _pool: Pool;

  /**
   * Creates a new MariaDB database instance.
   * @param {DatabaseConfig} config - The configuration
   */
  public constructor(config: DatabaseConfig) {
    super();
    this._pool = createPool({
      ...config,
      connectTimeout: CONSTANT.CONNECTION_TIMEOUT * 1000,
      idleTimeout: CONSTANT.IDLE_TIMEOUT,
      pipelining: false,
      acquireTimeout: 8000,
    });
  }

  /**
   * Creates a new database client with its own connection.
   * @returns {Promise<MariaClient>}
   */
  public override async createClient(): Promise<MariaClient> {
    const connection = await this._pool.getConnection();
    const client = new MariaClient(connection);
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
