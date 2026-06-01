import type { Model } from "../source/mod.ts";

export interface IFooModel extends Model {
  id: number;
  name: string;
  date_timestamp: Date;
}
