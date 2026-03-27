import { Expose } from 'class-transformer';
import { PlayerStatus } from './player';

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
  thirdRoundReversal!: boolean;

  @Expose()
  totalParticipants!: number;

  @Expose()
  playerStates!: Record<string, PlayerStatus>;
}
