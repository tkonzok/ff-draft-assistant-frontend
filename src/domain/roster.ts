import { Expose } from 'class-transformer';

export class Roster {
  @Expose()
  starters!: string[];

  @Expose()
  roster_id!: number;

  @Expose()
  players!: string[];

  @Expose()
  owner_id!: string;

  @Expose()
  league_id!: string;
}
