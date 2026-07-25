import { faker } from "@faker-js/faker";

export const MARIA_QUERIES = {
  TABLE: {
    DROP: (table: string) => `DROP TABLE IF EXISTS ${table};`,
    CREATE: (table: string) =>
      `CREATE TABLE ${table} (` +
      "id INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "date_timestamp TIMESTAMP(3) NOT NULL" +
      ");",
  },
  INSERT: (table: string): { query: string; binds: (string | Date)[] } => ({
    query:
      `INSERT INTO ${table} (name, date_timestamp) VALUES (?, ?) RETURNING id, name, date_timestamp;`,
    binds: [
      faker.person.firstName(),
      faker.date.anytime(),
    ],
  }),
  SELECT_ALL: (table: string) => `SELECT * FROM ${table} ORDER BY id ASC`,
};

export const PG_QUERIES = {
  TABLE: {
    DROP: (table: string) => `DROP TABLE IF EXISTS ${table};`,
    CREATE: (table: string) =>
      `CREATE TABLE ${table} (` +
      "id SERIAL NOT NULL PRIMARY KEY," +
      "name VARCHAR(255) NOT NULL," +
      "date_timestamp TIMESTAMP NOT NULL" +
      ");",
  },
  INSERT: (table: string): { query: string; binds: (string | Date)[] } => ({
    query:
      `INSERT INTO ${table} (name, date_timestamp) VALUES ($1, $2) RETURNING id, name, date_timestamp;`,
    binds: [
      faker.person.firstName(),
      faker.date.anytime(),
    ],
  }),
  SELECT_ALL: (table: string) => `SELECT * FROM ${table} ORDER BY id ASC`,
};
