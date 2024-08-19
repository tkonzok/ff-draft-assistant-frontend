import {Expose, Transform} from "class-transformer";
import {PlayerStatus} from "./player";

export class Draft {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  settings!: string;

  @Expose()
  draftPosition!: number;

  @Expose()
  totalParticipants!: number;

  @Expose()
  playerStates!: Record<string, PlayerStatus>
}
