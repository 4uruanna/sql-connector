// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionLimit?: number;
}