import { Expose } from 'class-transformer';

export class Settings {
  @Expose()
  id = 'global';

  @Expose()
  settings!: string[];
}
