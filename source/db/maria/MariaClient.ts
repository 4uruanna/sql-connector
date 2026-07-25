// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import type { PoolConnection } from "mariadb";
import { Client, type Model, type Result } from "@4uruanna/sql-connector";

/**
 * MariaDB client implementation.
 */
export class MariaClient extends Client {
  private _disposed: boolean = false;

  /**
   * Creates a new MariaClient.
   * @param {PoolConnection} _client - The pool connection to wrap.
   */
  public constructor(
    private readonly _client: PoolConnection
  ) {
    super();
  }

  /**
   * Disposes the client, releasing it back to the pool.
   * @returns {Promise<void>}
   */
  public override async dispose(): Promise<void> {
    await super.dispose();

    if (this._disposed === false) {
      try {
        this._client.release();
      } catch (error) {
        console.error("Failed to release client:", error);
      } finally {
        this._disposed = true;
      }
    }
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
   * @param {unknown[]|undefined} bindArray - Optional array of parameter bindings.
   * @returns {Promise<Result<T>>}
   */
  public async query<T = Model>(
    query: string,
    bindArray?: unknown[],
  ): Promise<Result<T>> {
    const result = await this._client.query<T[]>(
      {
        sql: query,
        rowsAsArray: false,
        bigIntAsNumber: true,
      },
      bindArray ?? [],
    );

    return {
      rows: result as T[],
    };
  }
}
