import { Expose, Transform } from 'class-transformer';

export class Settings {
  @Expose()
  @Transform(({ value }) => value ?? 'global', { toClassOnly: true })
  id?: string;

  @Expose()
  settings!: string[];
}
