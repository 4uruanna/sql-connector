// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import { Pool } from "pg";
import { Database, PgClient } from "../../mod.ts";

/**
 * PostgreSQL database implementation.
 */
export class PgDatabase extends Database {
  private readonly _pool: Pool;

  /**
   * Creates a new PostgreSQL database instance.
   * @param {string} host - The database server hostname.
   * @param {number} port - The database server port.
   * @param {string} database - The database name to connect to.
   * @param {string} user - The username for authentication.
   * @param {string} password - The password for authentication.
   * @param {string} schema - The default schema to use for connections.
   * @param {number} [poolSize=4] - The maximum number of connections in the pool.
   */
  public constructor(
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
    schema: string,
    poolSize: number = 4,
  ) {
    super();

    this._pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      min: 1,
      max: poolSize,
      idleTimeoutMillis: 30000,
      maxLifetimeSeconds: 120,
      connectionTimeoutMillis: 3000,
      onConnect: async (client) => {
        await client.query(`SET search_path TO ${schema}`);
      },
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
