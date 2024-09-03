import {Expose} from "class-transformer";

export class Settings {
  @Expose()
  settings!: string[];
}
