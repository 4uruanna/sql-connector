// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import type { PoolClient } from "pg";
import { Client, type Model, type Result } from "../../mod.ts";

/**
 * PostgreSQL client implementation.
 */
export class PgClient extends Client {
  private readonly _client: PoolClient;
  private _disposed: boolean = false;

  /**
   * Creates a new PgClient.
   * @param {PoolClient} client - The pool connection to wrap.
   */
  public constructor(client: PoolClient) {
    super();
    this._client = client;
  }

  /**
   * Disposes the client, releasing it back to the pool.
   * @returns {Promise<void>}
   */
  public override async dispose(): Promise<void> {
    await super.dispose();

    if(this._disposed === false) {
      this._client.release();
      this._disposed = true;
    }
  }

  /**
   * Starts a new transaction.
   * @returns {Promise<void>}
   */
  public override async begin(): Promise<void> {
    await super.begin();
    await this._client.query("BEGIN");
  }

  /**
   * Commits the current transaction.
   * @returns {Promise<void>}
   */
  public override async commit(): Promise<void> {
    await super.commit();
    await this._client.query("COMMIT");
  }

  /**
   * Rolls back the current transaction.
   * @returns {Promise<void>}
   */
  public override async rollback(): Promise<void> {
    await super.rollback();
    await this._client.query("ROLLBACK");
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
    bindArray?: unknown[],
  ): Promise<Result<T>> {
    const result = await this._client.query<T>({
      text: query,
      values: bindArray,
    });

    return {
      rows: result.rows,
    };
  }
}
