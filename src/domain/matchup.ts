import {Expose} from "class-transformer";

export class Matchup {
  @Expose()
  starters!: string[];

  @Expose()
  roster_id!: number;

  @Expose()
  players!: string[];

  @Expose()
  matchup_id!: number;

  @Expose()
  points!: number;

  @Expose()
  starters_points!: number[];
}
