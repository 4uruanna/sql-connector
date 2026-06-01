// Copyright 2026 Villalonga Software. All rights reserved. Apache-2.0 license.

/**
 * Represents a generic model/row as a record with string keys and unknown values.
 */
export type Model = Record<string, unknown>;

/**
 * Represents the result of a database query.
 * @template T - The model type of the rows in the result
 */
export type Result<T> = { rows: T[] };
