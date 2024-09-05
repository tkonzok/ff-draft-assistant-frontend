import {Expose} from "class-transformer";

export class SleeperPlayer {
  @Expose()
  player_id!: string;

  @Expose()
  first_name!: string;

  @Expose()
  last_name!: string;

  @Expose()
  fantasy_positions!: string[];

  @Expose()
  status!: string;

  @Expose()
  team!: string;

  @Expose()
  injury_status!: string;
}
