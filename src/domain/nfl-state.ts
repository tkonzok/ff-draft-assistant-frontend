import { Expose } from 'class-transformer';

export class NflState {
  @Expose()
  week!: number;

  @Expose()
  display_week!: number;

  @Expose()
  season!: string;
}
