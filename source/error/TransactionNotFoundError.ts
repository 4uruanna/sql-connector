// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

/**
 * Indicates that a transaction must be started before commit or rollback
 */
export class TransactionNotFoundError extends Error {
  public constructor() {
    super("Transaction must be start before commiting of rollbacking it.");
  }
}
