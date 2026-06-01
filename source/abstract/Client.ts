// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import {
  type Model,
  type Result,
  TransactionInProgressError,
  TransactionNotFoundError,
} from "../mod.ts";

/**
 * Abstract base class for SQL database clients.
 */
export abstract class Client {
  private _inTransaction: boolean = false;

  /**
   * Executes a SQL query and returns the result.
   * @template T - The model type for the query results.
   * @param {string} query - The SQL query string to execute.
   * @param {unknown[]} [binds] - Optional array of parameter bindings for prepared statements.
   * @returns {Promise<Result<T>>}
   */
  public abstract query<T extends Model>(
    query: string,
    binds?: unknown[],
  ): Promise<Result<T>>;

  /**
   * Disposes the client, rolling back any active transaction.
   * @returns {Promise<void>}
   */
  public async dispose(): Promise<void> {
    if (this._inTransaction === true) {
      await this.rollback();
      this._inTransaction = false;
    }
  }

  /**
   * Starts a new transaction.
   * @returns {Promise<void>}
   * @throws {TransactionInProgressError} If a transaction is already in progress.
   */
  public begin(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._inTransaction === false) {
        this._inTransaction = true;
        resolve();
      } else {
        this.dispose().finally(() => reject(new TransactionInProgressError()));
      }
    });
  }

  /**
   * Commits the current transaction.
   * @returns {Promise<void>}
   * @throws {SqlTransactionError} If no transaction is currently active.
   */
  public commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._inTransaction === true) {
        this._inTransaction = false;
        resolve();
      } else {
        this.dispose().finally(() => reject(new TransactionNotFoundError()));
      }
    });
  }

  /**
   * Rolls back the current transaction.
   * @returns {Promise<void>}
   * @throws {SqlTransactionError} If no transaction is currently active.
   */
  public rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._inTransaction === true) {
        this._inTransaction = false;
        resolve();
      } else {
        this.dispose().finally(() => reject(new TransactionNotFoundError()));
      }
    });
  }
}
