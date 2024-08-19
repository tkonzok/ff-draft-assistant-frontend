import { Expose, Transform, Type } from "class-transformer";
import { Position } from "../components/position/position.component";

export enum PlayerStatus {
  AVAILABLE,
  NOT_AVAILABLE,
  DRAFTED,
}

export class Player {
  @Expose()
  id!: string;

  @Expose()
  pos!: Position;

  @Expose()
  name!: string;

  @Expose()
  team!: string;

  @Expose()
  bye!: string;

  @Expose()
  @Transform(({ value }) => value ?? PlayerStatus.AVAILABLE)
  status!: PlayerStatus;

  @Expose()
  @Transform(({ value }) => value || {})
  rankings!: Record<string, RankingDetails>;
}

export class RankingDetails {
  @Expose()
  ovr!: string;

  @Expose()
  rank!: string;

  @Expose()
  tier!: string;

  @Expose()
  @Transform(({ value }) => value ?? false)
  isLastOfTier!: boolean;
}
