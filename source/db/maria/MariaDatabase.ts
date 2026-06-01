// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { createPool, type Pool } from "mariadb";
import { Database, MariaClient } from "../../mod.ts";

/**
 * MariaDB database implementation.
 */
export class MariaDatabase extends Database {
  private readonly _pool: Pool;

  /**
   * Creates a new MariaDB database instance.
   * @param {string} host - The database server hostname.
   * @param {number} port - The database server port.
   * @param {string} database - The database name to connect to.
   * @param {string} user - The username for authentication.
   * @param {string} password - The password for authentication.
   * @param {number} [poolSize=4] - The maximum number of connections in the pool.
   */
  public constructor(
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
    poolSize: number = 4,
  ) {
    super();
    this._pool = createPool({
      host,
      port,
      database,
      user,
      password,
      connectionLimit: poolSize,
      connectTimeout: 4000,
      idleTimeout: 30,
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
