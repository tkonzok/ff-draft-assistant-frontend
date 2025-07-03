import { Expose } from 'class-transformer';

export class Schedule {
  @Expose()
  objectId!: string;

  @Expose()
  week!: number;

  @Expose()
  homeTeam!: string;

  @Expose()
  guestTeam!: string;

  @Expose()
  date!: string;
}
