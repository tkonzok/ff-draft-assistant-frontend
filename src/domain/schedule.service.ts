import {Injectable} from "@angular/core";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Schedule} from "./schedule";
import {map} from "rxjs";
import {plainToInstance} from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class ScheduleService {
  private static readonly SCHEDULE_URL: string = `${environment.apiUrl}/schedule`;

  constructor(
    private http: HttpClient,
  ) {}

  getSchedule() {
    return this.http.get<Schedule[]>(ScheduleService.SCHEDULE_URL).pipe(
      map((schedule) => plainToInstance(Schedule, schedule, {excludeExtraneousValues: true}))
    )
  }
}
