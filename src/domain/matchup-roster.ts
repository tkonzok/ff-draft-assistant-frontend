import { Expose } from 'class-transformer';
import { SleeperPlayer } from './sleeper-player';

export class MatchupRoster {
  @Expose()
  starters!: (SleeperPlayer | undefined)[];

  @Expose()
  roster_id!: number;

  @Expose()
  points!: number;

  @Expose()
  starters_points!: number[];
}
