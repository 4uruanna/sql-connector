// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

import type { Client } from "../mod.ts";

/**
 * Abstract base class for SQL database implementations.
 */
export abstract class Database {
  /**
   * Creates a new database client with its own connection.
   * @returns {Promise<Client>}
   */
  abstract createClient(): Promise<Client>;

  /**
   * Disposes the database.
   * @returns {Promise<void>}
   */
  abstract dispose(): Promise<void>;
}
