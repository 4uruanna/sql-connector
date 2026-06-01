// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

/**
 * Indicates that a transaction is already in progress.
 */
export class TransactionInProgressError extends Error {
  public constructor() {
    super("A transaction has already begun.");
  }
}
