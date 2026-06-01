// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import type { PoolConnection } from "mariadb";
import { Client, type Model, type Result } from "../../mod.ts";

/**
 * MariaDB client implementation.
 */
export class MariaClient extends Client {
  private readonly _client: PoolConnection;

  /**
   * Creates a new MariaClient.
   * @param {PoolConnection} client - The pool connection to wrap.
   */
  public constructor(client: PoolConnection) {
    super();
    this._client = client;
  }

  /**
   * Disposes the client, releasing it back to the pool.
   * @returns {Promise<void>}
   */
  public override async dispose(): Promise<void> {
    await super.dispose();
    await this._client.release();
  }

  /**
   * Starts a new transaction.
   * @returns {Promise<void>}
   */
  public override async begin(): Promise<void> {
    await super.begin();
    await this._client.query("START TRANSACTION;");
  }

  /**
   * Commits the current transaction.
   * @returns {Promise<void>}
   */
  public override async commit(): Promise<void> {
    await super.commit();
    await this._client.query("COMMIT;");
  }

  /**
   * Rolls back the current transaction.
   * @returns {Promise<void>}
   */
  public override async rollback(): Promise<void> {
    await super.rollback();
    await this._client.query("ROLLBACK;");
  }

  /**
   * Executes a SQL query and returns the result.
   * @template T - The model type for the query results.
   * @param {string} query - The SQL query string to execute.
   * @param {unknown[]} [binds] - Optional array of parameter bindings.
   * @returns {Promise<Result<T>>}
   */
  public async query<T extends Model = Record<PropertyKey, never>>(
    query: string,
    binds?: unknown[],
  ): Promise<Result<T>> {
    const result = await this._client.query<T[]>(
      {
        sql: query,
        rowsAsArray: false,
        bigIntAsNumber: true,
      },
      binds ?? [],
    );

    return {
      rows: result as T[],
    };
  }
}
